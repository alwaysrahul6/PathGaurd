#include <WiFi.h>
#include <HTTPClient.h>
#include <TinyGPSPlus.h>

static const int RXPin = 16;
static const int TXPin = 17;
static const uint32_t GPSBaud = 9600;
TinyGPSPlus gps;

const char* ssid = "Galaxy F12 D64F";
const char* password = "000@0000";
const char* serverUrl = "http://10.111.161.176:5000/api/gps";

WiFiClient client;

void setup() {
  Serial.begin(115200);
  Serial2.begin(GPSBaud, SERIAL_8N1, RXPin, TXPin);

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");
  Serial.print("ESP32 IP: "); Serial.println(WiFi.localIP());
}

unsigned long lastPost = 0;

void loop() {
  while (Serial2.available() > 0) {
    gps.encode(Serial2.read());
  }

  if (gps.location.isUpdated() && gps.location.isValid()) {
    double lat = gps.location.lat();
    double lng = gps.location.lng();

    if (millis() - lastPost > 2000) {
      lastPost = millis();
      postLocation(lat, lng);
    }
  }
}

void postLocation(double lat, double lng) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi not connected");
    return;
  }

  HTTPClient http;
  http.setConnectTimeout(8000);
  http.setTimeout(8000);

  if (!http.begin(client, serverUrl)) {
    Serial.println("HTTP begin failed");
    return;
  }
  http.addHeader("Content-Type", "application/json");

  String payload = String("{\"latitude\":") + String(lat, 6) +
                   String(",\"longitude\":") + String(lng, 6) +
                   String(",\"device_id\":\"ESP32\"}");

  int code = http.POST(payload);
  Serial.print("POST "); Serial.print(code); Serial.print(" -> ");
  if (code > 0) {
    Serial.println(http.getString());
  } else {
    Serial.println("error"); // -1 means connection failed/timeout
  }
  http.end();
}
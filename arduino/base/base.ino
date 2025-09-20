/* soldier.ino
   ESP32 Soldier device:
   - Reads GPS (TinyGPS++)
   - Sends JSON packet over LoRa to Base
   - Waits for ACK from Base (simple ACK protocol)
   - Retries if no ACK
*/

#include <SPI.h>
#include <LoRa.h>
#include <TinyGPS++.h>
#include <ArduinoJson.h>

// ======== CONFIG ========
#define LORA_SS    18   // SX1278 NSS/CS
#define LORA_RST   14   // SX1278 RST
#define LORA_DIO0  26   // SX1278 DIO0
#define LORA_SCK   5
#define LORA_MISO  19
#define LORA_MOSI  27

#define GPS_RX_PIN 16   // GPS TX -> this pin (RX of ESP32)
#define GPS_TX_PIN 17   // usually unused
#define GPS_BAUD   9600

#define LORA_FREQ  915E6  // change to your region (e.g., 433E6, 868E6)
#define SEND_INTERVAL_MS 5000UL   // send every 5 seconds (adjust)
#define ACK_TIMEOUT_MS    2000UL  // wait this long for ACK
#define MAX_RETRIES       3

const char* DEVICE_ID = "soldier-01";
const char* IOT_TOKEN  = "PATHGUARD_TOKEN_ABC123"; // replace and keep secret

// ======== GLOBALS ========
TinyGPSPlus gps;
HardwareSerial GPSSerial(1); // use UART1 for GPS
unsigned long lastSend = 0;
unsigned long seq = 0;

void setup() {
  Serial.begin(115200);
  delay(200);
  Serial.println("Soldier ESP32 starting...");

  // GPS UART init
  GPSSerial.begin(GPS_BAUD, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);

  // SPI pins for LoRa
  SPI.begin(LORA_SCK, LORA_MISO, LORA_MOSI, LORA_SS);
  LoRa.setPins(LORA_SS, LORA_RST, LORA_DIO0);

  if (!LoRa.begin(LORA_FREQ)) {
    Serial.println("LoRa init failed. Check wiring.");
    while (true) { delay(1000); }
  }
  Serial.println("LoRa init OK");
}

void loop() {
  // Feed GPS parser
  while (GPSSerial.available()) {
    gps.encode(GPSSerial.read());
  }

  unsigned long now = millis();
  if (now - lastSend >= SEND_INTERVAL_MS) {
    lastSend = now;
    sendPosition();
  }

  // optional: handle background LoRa receive for unsolicited messages
  int packetSize = LoRa.parsePacket();
  if (packetSize) {
    // receive but we already handle ACK waiting in sendPosition
    String incoming = "";
    while (LoRa.available()) incoming += (char)LoRa.read();
    Serial.println("LoRa recv (background): " + incoming);
  }
}

void sendPosition() {
  float lat = NAN, lng = NAN;
  double altitude = NAN;
  if (gps.location.isValid()) {
    lat = gps.location.lat();
    lng = gps.location.lng();
  }
  if (gps.altitude.isValid()) {
    altitude = gps.altitude.meters();
  }

  // Build JSON using ArduinoJson
  StaticJsonDocument<256> doc;
  doc["device"] = DEVICE_ID;
  doc["token"] = IOT_TOKEN;
  doc["seq"] = seq;
  if (!isnan(l

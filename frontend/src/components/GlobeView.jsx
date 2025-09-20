import Globe from "react-globe.gl";

export default function GlobeView({ globeArcs, globeRef }) {
  // Extract attack points from arcs
  const attackPoints = globeArcs.map(arc => ({
    lat: arc.startLat,
    lng: arc.startLng,
    size: 8,
    color: arc.color[0],
    label: arc.label
  }));

  return (
    <div className="h-[300px] w-full flex items-center justify-center">
      <Globe
        ref={globeRef}
        width={350}
        height={300}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        arcsData={globeArcs}
        arcColor={(d) => d.color}
        arcDashLength={() => 0.6}
        arcDashGap={() => 0.3}
        arcDashAnimateTime={() => 3000}
        arcStroke={() => 2}
        arcAltitudeAutoScale={0.3}
        pointsData={attackPoints}
        pointColor="color"
        pointAltitude={0.01}
        pointRadius={2}
        pointResolution={8}
        atmosphereColor="#22c55e"
        atmosphereAltitude={0.15}
        showAtmosphere={true}
        showGraticules={true}
        graticuleColor="rgba(34, 197, 94, 0.2)"
        pointOfView={{ lat: 20, lng: 0, altitude: 1.8 }}
        enablePointerInteraction={true}
      />
    </div>
  );
}

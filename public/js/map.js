if (listingGeometry && listingGeometry.coordinates) {

    const coordinates = listingGeometry.coordinates;

    const map = new maplibregl.Map({
        container: "map",
        style: `https://maps.geoapify.com/v1/styles/osm-bright-smooth/style.json?apiKey=${mapToken}`,
        center: coordinates,
        zoom: 12
    });

    map.addControl(
        new maplibregl.NavigationControl(),
        "top-right"
    );

    map.on("load", () => {
        map.resize();
    });

    const marker = new maplibregl.Marker({
        color: "#fe424d"
    })
        .setLngLat(coordinates)
        .addTo(map);

    marker.setPopup(
        new maplibregl.Popup({
            offset: 25
        }).setHTML(`
            <h6>${listingTitle}</h6>
            <p>${listingLocation}</p>
        `)
    );

} else {
    console.log("No coordinates found");
}
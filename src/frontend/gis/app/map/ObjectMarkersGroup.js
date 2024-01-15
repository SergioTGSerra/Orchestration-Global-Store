"use client"
import React, { useEffect, useState } from 'react';
import { LayerGroup, useMap } from 'react-leaflet';
import { ObjectMarker } from "./ObjectMarker";

function ObjectMarkersGroup() {

    async function fetchData(bounds) {
        try {
            const response = await fetch(`http://localhost:20002/api/tile?neLat=${bounds.getNorthEast().lat}&neLng=${bounds.getNorthEast().lng}&swLat=${bounds.getSouthWest().lat}&swLng=${bounds.getSouthWest().lng}`);
            const responseData = await response.json();
            setData(responseData.features);
            console.log(responseData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    const map = useMap();
    const [data, setData] = useState(null);
    const [geom, setGeom] = useState(null);
    const [bounds, setBounds] = useState(map.getBounds());

    /**
     * Setup the event to update the bounds automatically
     */
    useEffect(() => {
        const cb = () => {
            setBounds(map.getBounds());
        }
        map.on('moveend', cb);

        return () => {
            map.off('moveend', cb);
        }
    }, [map]);

    /* Updates the data for the current bounds */
    useEffect(() => {
        console.log(`> getting data for bounds north east`, bounds.getNorthEast().lat, bounds.getNorthEast().lng);
        console.log(`> getting data for bounds south west`, bounds.getSouthWest().lat, bounds.getSouthWest().lng);
        fetchData(bounds);
    }, [bounds]);

    // Update geom when data changes
    useEffect(() => {
        if (data) {
            setData(data);
            console.log(`> data updated`);
            console.log(data);
        }
    }, [data]);

    return (
        <LayerGroup>
            {
                data && data.map(geoJSON => <ObjectMarker key={geoJSON.properties.id} geoJSON={geoJSON} />)
            }
        </LayerGroup>

    );
}

export default ObjectMarkersGroup;

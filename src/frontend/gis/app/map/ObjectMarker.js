"use client"
import {Avatar, List, ListItem, ListItemIcon, ListItemText} from "@mui/material";
import FlagIcon from '@mui/icons-material/Flag';
import PictureInPictureAltIcon from '@mui/icons-material/PictureInPictureAlt';
import ContactsIcon from '@mui/icons-material/Contacts';
import React from "react";
import {Marker, Popup} from 'react-leaflet';
import {icon as leafletIcon, point} from "leaflet";

const LIST_PROPERTIES = [
    {"key": "state_name", label: "State", Icon: FlagIcon},
];

export function ObjectMarker({geoJSON}) {
    const properties = geoJSON?.properties
    const {uuid, name} = properties;
    const coordinates = geoJSON?.geometry?.coordinates;

    return (
        <Marker
            position={coordinates}
            icon={leafletIcon({
                iconUrl: "https://cdn-icons-png.flaticon.com/128/3001/3001764.png",
                iconRetinaUrl: "https://cdn-icons-png.flaticon.com/128/3001/3001764.png",
                iconSize: point(30, 30),
            })}
        >
            <Popup>
                <List dense={true}>
                    <ListItem>
                        <ListItemIcon>
                            <Avatar alt={name} src={"https://cdn-icons-png.flaticon.com/128/3001/3001764.png"}/>
                        </ListItemIcon>
                        <ListItemText primary={name}/>
                    </ListItem>
                    {
                        LIST_PROPERTIES
                            .map(({key, label, Icon}) =>
                                <ListItem key={key}>
                                    <ListItemIcon>
                                        <Icon style={{color: "black"}}/>
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={<span>
                                        {properties[key]}<br/>
                                        <label style={{fontSize: "xx-small"}}>({label})</label>
                                    </span>}
                                    />
                                </ListItem>
                            )
                    }

                </List>

            </Popup>
        </Marker>
    )
}
"use client";
import {useCallback, useEffect, useState} from "react";
import { CircularProgress, Pagination, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import {useSearchParams, useRouter, usePathname} from 'next/navigation';

export default function PlayersPage({pagea}) {

    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    const createQueryString = useCallback(
        (name, value) => {
            const params = new URLSearchParams(searchParams)
            params.set(name, value)

            return params.toString()
        },
        [searchParams]
    );
    const [data, setData] = useState(null);
    const [maxDataSize, setMaxDataSize] = useState(0);

    const page = parseInt(searchParams.get('page')) || 1;
    const PAGE_SIZE = 10;

    useEffect(() => {
        setData(null);
        console.log(`fetching from ${process.env.NEXT_PUBLIC_API_ENTITIES_URL}`);
        fetch('http://localhost:20001/customers')
            .then(response => response.json())
            .then(data => {
                const segmentPromises = data.map(row => {
                    return fetch(`http://localhost:20001/segments/${row.segment}`)
                        .then(response => response.json())
                        .then(segmentData => {
                            row.segment = segmentData.name;
                        });
                });

                const statePromises = data.map(row => {
                    return fetch(`http://localhost:20001/states/${row.state}`)
                        .then(response => response.json())
                        .then(stateData => {
                            row.state = stateData.name;
                        });
                });

                const countryPromises = data.map(row => {
                    return fetch(`http://localhost:20001/countries/${row.country}`)
                        .then(response => response.json())
                        .then(countryData => {
                            row.country = countryData.name;
                        });
                });

                return Promise.all(segmentPromises, statePromises, countryPromises)
                    .then(() => {
                        if (data !== null) {
                            setMaxDataSize(data.length);
                            setData(data.filter((item, index) => Math.floor(index / PAGE_SIZE) === (page - 1)));
                        }
                    });
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }, [page]);
     
    return (
        <>
            <h1 sx={{fontSize: "100px"}}>Customers</h1>

            <TableContainer component={Paper}>
                <Table sx={{minWidth: 650}} aria-label="simple table">
                    <TableHead>
                        <TableRow sx={{backgroundColor: "lightgray"}}>
                            <TableCell component="th" align="left">ID</TableCell>
                            <TableCell>Customer Name</TableCell>
                            <TableCell>Segment</TableCell>
                            <TableCell>Postal code</TableCell>
                            <TableCell>City</TableCell>
                            <TableCell>State</TableCell>
                            <TableCell>Country</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            data ?
                                data.map((row) => (
                                    <TableRow
                                        key={row.uuid}
                                    >
                                        <TableCell component="td" align="left">{row.uuid} </TableCell>
                                        <TableCell component="td" scope="row">{row.name} </TableCell>
                                        <TableCell component="td" scope="row">{row.segment} </TableCell>
                                        <TableCell component="td" scope="row">{row.postal_code} </TableCell>
                                        <TableCell component="td" scope="row">{row.city} </TableCell>
                                        <TableCell component="td" scope="row">{row.state} </TableCell>
                                        <TableCell component="td" scope="row">{ row.country }</TableCell>
                                    </TableRow>
                                ))
                                :
                                <TableRow>
                                    <TableCell colSpan={3}>
                                        <CircularProgress/>
                                    </TableCell>
                                </TableRow>
                        }
                    </TableBody>
                </Table>
            </TableContainer>
            {
                maxDataSize && <Pagination style={{color: "black", marginTop: 8}}
                                           variant="outlined" shape="rounded"
                                           color={"primary"}
                                           onChange={(e, v) => {
                                               router.push(pathname + '?' + createQueryString('page', v))
                                           }}
                                           page={page}
                                           count={Math.ceil(maxDataSize / PAGE_SIZE)}
                />
            }


        </>
    );
}
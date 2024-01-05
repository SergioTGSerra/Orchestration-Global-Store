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

    const fetchData = async () => {
        setData(null);
        console.log(`fetching from ${process.env.NEXT_PUBLIC_API_ENTITIES_URL}`);
        try {
            const response = await fetch('http://localhost:20001/customers');
            const data = await response.json();
    
            if (data !== null) {
                setMaxDataSize(data.length);
                setData(data.filter((item, index) => Math.floor(index / PAGE_SIZE) === (page - 1)));
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    
    useEffect(() => {
        fetchData();
    }, [page]);
     
    return (
        <>
            <h1 sx={{fontSize: "100px"}}>Customers</h1>

            <TableContainer component={Paper}>
                <Table sx={{minWidth: 650}} aria-label="simple table">
                    <TableHead>
                        <TableRow sx={{backgroundColor: "lightgray"}}>
                            <TableCell component="th" align="left" sx={{ width: '30%' }}>ID</TableCell>
                            <TableCell component="th" align="center" sx={{ width: '14%' }}>Customer Name</TableCell>
                            <TableCell component="th" align="center" sx={{ width: '12%' }}>Segment</TableCell>
                            <TableCell component="th" align="center" sx={{ width: '12%' }}>Postal code</TableCell>
                            <TableCell component="th" align="center" sx={{ width: '12%' }}>City</TableCell>
                            <TableCell component="th" align="center" sx={{ width: '12%' }}>State</TableCell>
                            <TableCell component="th" align="center" sx={{ width: '12%' }}>Country</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            data ?
                                data.map((row, index) => (
                                    <TableRow
                                        key={row.uuid}
                                        sx={{ backgroundColor: index % 2 === 0 ? 'rgba(0, 0, 0, 0.03)' : 'white' }}
                                    >
                                        <TableCell component="td" align="left">{row.uuid} </TableCell>
                                        <TableCell component="td" scope="row" align="center">{row.name} </TableCell>
                                        <TableCell component="td" scope="row" align="center">{row.Segment.name} </TableCell>
                                        <TableCell component="td" scope="row" align="center">{row.postal_code || "-"} </TableCell>
                                        <TableCell component="td" scope="row" align="center">{row.city} </TableCell>
                                        <TableCell component="td" scope="row" align="center">{row.State.name} </TableCell>
                                        <TableCell component="td" scope="row" align="center">{ row.Country.name }</TableCell>
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
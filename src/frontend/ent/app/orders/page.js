"use client";
import {useCallback, useEffect, useState} from "react";
import { CircularProgress, Pagination, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button } from "@mui/material";
import {useSearchParams, useRouter, usePathname} from 'next/navigation';
import Link from 'next/link';

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
            const response = await fetch('http://localhost:20001/orders');
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
            <h1 sx={{fontSize: "100px"}}>Orders</h1>

            <TableContainer component={Paper}>
                <Table sx={{minWidth: 650}} aria-label="simple table">
                    <TableHead>
                        <TableRow sx={{backgroundColor: "lightgray"}}>
                            <TableCell component="th" align="left" sx={{ width: '20%' }}>ID</TableCell>
                            <TableCell component="th" align="center" sx={{ width: '10%' }}>Order Date</TableCell>
                            <TableCell component="th" align="center" sx={{ width: '10%' }}>Ship Date</TableCell>
                            <TableCell component="th" align="center" sx={{ width: '10%' }}>Priority</TableCell>
                            <TableCell component="th" align="center" sx={{ width: '10%' }}>Ship Mode</TableCell>
                            <TableCell component="th" align="center" sx={{ width: '5%' }}>Shipping Cost</TableCell>
                            <TableCell component="th" align="center" sx={{ width: '10%' }}>Customer Name</TableCell>
                            <TableCell component="th" align="center" sx={{ width: '15%' }}>Market</TableCell>
                            <TableCell component="th" align="center" sx={{ width: '10%' }}>Actions</TableCell>
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
                                        <TableCell component="td" align="left">{ row.uuid }</TableCell>
                                        <TableCell component="td" scope="row" align="center">{ new Date(row.order_date).toLocaleDateString() }</TableCell>
                                        <TableCell component="td" scope="row" align="center">{ new Date(row.ship_date).toLocaleDateString() }</TableCell>
                                        <TableCell component="td" scope="row" align="center">{ row.Priority.name }</TableCell>
                                        <TableCell component="td" scope="row" align="center">{ row.ShipMode.name }</TableCell>
                                        <TableCell component="td" scope="row" align="center">{ row.shipping_cost }</TableCell>
                                        <TableCell component="td" scope="row" align="center">{ row.Customer.name }</TableCell>
                                        <TableCell component="td" scope="row" align="center">{ row.Market.name } - { row.Market.region }</TableCell>
                                        <TableCell component="td" scope="row" align="center">
                                        <Link href={`/orders/${row.uuid}`}>
                                        <div style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}>
                                            Show Products
                                        </div>
                                    </Link>
                                        </TableCell>
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
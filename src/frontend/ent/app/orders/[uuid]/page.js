"use client";
import { useCallback, useEffect, useState } from "react";
import { CircularProgress, Pagination, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export default function Page({ params }) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    const createQueryString = useCallback(
        (name, value) => {
            const params = new URLSearchParams(searchParams)
            params.set(name, value);

            return params.toString();
        },
        [searchParams]
    );
    const [data, setData] = useState(null);
    const [maxDataSize, setMaxDataSize] = useState(0);
    const [orderData, setOrderData] = useState(null);

    const page = parseInt(searchParams.get('page')) || 1;
    const PAGE_SIZE = 10;

    const fetchData = async () => {
        setData(null);
        try {
            const [response, orderResponse] = await Promise.all([
                fetch(`http://localhost:20001/orders/${params.uuid}/products`).then(res => res.json()),
                fetch(`http://localhost:20001/orders/${params.uuid}`).then(res => res.json())
            ]);

            const categoryPromises = response.map((row, index) => {
                return fetch(`http://localhost:20001/categories/${row.Product.category}`)
                    .then(response => response.json())
                    .then(categoryData => {
                        row.Product.category = categoryData.name;
                        console.log(`Category promise resolved for index ${index}`);
                    });
            });

            const customerPromises = response.map((row, index) => {
                return fetch(`http://localhost:20001/customers/${orderResponse.customer}`)
                    .then(response => response.json())
                    .then(customerData => {
                        orderResponse.customer = customerData.name;
                        console.log(`Customer promise resolved for index ${index}`);
                    });
            });

            // Wait for all promises to be resolved before updating the data
            await Promise.all([...categoryPromises, ...customerPromises]);

            if (response !== null) {
                setMaxDataSize(response.length);
                setData(response.filter((item, index) => Math.floor(index / PAGE_SIZE) === (page - 1)));
                setOrderData(orderResponse);
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
            <h1 sx={{ fontSize: "100px" }}>Products of Order of {orderData?.customer} created at {new Date(orderData?.order_date).toLocaleDateString()}</h1>

            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: "lightgray" }}>
                            <TableCell component="th" align="left" sx={{ width: '20%' }}>Product ID</TableCell>
                            <TableCell component="th" align="center" sx={{ width: '10%' }}>Product Name</TableCell>
                            <TableCell component="th" align="center" sx={{ width: '10%' }}>Product Category</TableCell>
                            <TableCell component="th" align="center" sx={{ width: '10%' }}>Quantity</TableCell>
                            <TableCell component="th" align="center" sx={{ width: '10%' }}>Discount</TableCell>
                            <TableCell component="th" align="center" sx={{ width: '5%' }}>Sales</TableCell>
                            <TableCell component="th" align="center" sx={{ width: '10%' }}>Profit</TableCell>
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
                                        <TableCell component="td" align="left">{row.Product.uuid}</TableCell>
                                        <TableCell align="center">{row.Product.name}</TableCell>
                                        <TableCell align="center">{row.Product.category}</TableCell>
                                        <TableCell align="center">{row.quantity}</TableCell>
                                        <TableCell align="center">{row.discount}</TableCell>
                                        <TableCell align="center">{row.sales}</TableCell>
                                        <TableCell align="center">{row.profit}</TableCell>
                                    </TableRow>
                                ))
                                :
                                <TableRow>
                                    <TableCell colSpan={7}>
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                        }
                    </TableBody>
                </Table>
            </TableContainer>
            {
                maxDataSize && <Pagination style={{ color: "black", marginTop: 8 }}
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
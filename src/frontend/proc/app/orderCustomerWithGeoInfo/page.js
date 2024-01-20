"use client";   
import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Container, FormControl, InputLabel, MenuItem, Select} from "@mui/material";
import { Diversity1 } from "@mui/icons-material";

function orderCustomerWithGeoInfo() {
  const [selectedCountry, setSelectedCountry] = useState("");
  const [procData, setProcData] = useState(null);
  const [gqlData, setGQLData] = useState(null);

  useEffect(() => {
      async function fetchOrders() {
          try {
              const response = await fetch('http://localhost:20004/api/orderCustomerWithGeoInfo');
              const data = await response.json();
  
              // Verificando a estrutura dos dados
              const orderArray = data.Orders && data.Orders.Order;
  
              if (orderArray) {
                setProcData(orderArray);
              } else {
                  console.error('Orders not found in the API response:', data);
              }
          } catch (error) {
              console.error('Error fetching orders:', error);
          }
      }

      async function fetchOrdersGQL() {
        try {
          const response = await fetch('http://localhost:20003/graphql', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: `
                query Get_order_details {
                  get_order_details {
                      order_id
                      order_date
                      shipped_date
                      ship_mode
                      customer_name
                      postal_code
                      state_name
                      state_geometry
                  }
              }
                `
            })
          });
        
          const data = await response.json();
          setGQLData(data.data.get_order_details);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
      }
  
      fetchOrders();
      fetchOrdersGQL();
  }, []);

  return (
    <>

      <Container
        maxWidth="100%"
        sx={{
          backgroundColor: "info.dark",
          padding: "2rem",
          marginTop: "2rem",
          borderRadius: "1rem",
          color: "white",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
          Results <small>(PROC)</small>
        </h1>
        {procData ? (
          <ul>
            {procData && procData.map((data) => (
              <div>
                <li key={data.id}>Order date: {data.order_date} Shipped date: {data.shipped_date} Ship mode: {data.ship_mode} Customer name: {data.customer_name}</li>
              </div>              
            ))}
          </ul>
        ) : selectedCountry ? (
          <CircularProgress />
        ) : (
          "--"
        )}

        <br />

        <h1 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
          Results <small>(GraphQL)</small>
        </h1>
        {gqlData ? (
          <ul>
            {gqlData.map((data) => (
              <div>
                <li key={data.order_id}>Order date: {data.order_date} Shipped date: {data.shipped_date} Ship mode: {data.ship_mode} Customer name: {data.customer_name}</li>
              </div>            ))}
          </ul>
        ) : selectedCountry ? (
          <CircularProgress />
        ) : (
          "--"
        )}
      </Container>
    </>
  );
}

export default orderCustomerWithGeoInfo;
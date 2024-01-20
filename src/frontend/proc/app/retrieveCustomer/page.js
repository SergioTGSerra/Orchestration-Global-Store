"use client";   
import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Container, FormControl, InputLabel, MenuItem, Select} from "@mui/material";
import { Diversity1 } from "@mui/icons-material";

function Customer_Address() {
  const [selectedCountry, setSelectedCountry] = useState("");
  const [procData, setProcData] = useState(null);
  const [gqlData, setGQLData] = useState(null);

  useEffect(() => {
      async function fetchOrders() {
          try {
              const response = await fetch('http://localhost:20004/api/retrieveCustomer');
              const data = await response.json();
  
              // Verificando a estrutura dos dados
              const orderArray = data.Customers && data.Customers.Customer_Address;
  
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
                query Get_customers {
                    get_customers {
                        customer_id
                        customer_name
                        postal_code
                        city
                        country_name
                        state_name
                        state_geometry
                    }
                }
                `
            })
          });

          const data = await response.json();
          setGQLData(data.data.get_customers);
        }catch (error) {
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
                <li key={data.id}>id: {data.id} Name: {data.name} City: {data.city} Country: {data.country_name}</li>
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
                <li key={data.customer_id}>id: {data.customer_id} Name: {data.customer_name} City: {data.city} Country: {data.country_name}</li>
              </div>
            ))}
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

export default Customer_Address;
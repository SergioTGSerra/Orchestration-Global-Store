"use client";   
import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Container, FormControl, InputLabel, MenuItem, Select} from "@mui/material";
import { Diversity1 } from "@mui/icons-material";

function countCostumersBySegment() {
  const [selectedCountry, setSelectedCountry] = useState("");
  const [procData, setProcData] = useState(null);
  const [gqlData, setGQLData] = useState(null);

  useEffect(() => {
      async function fetchOrders() {
          try {
              const response = await fetch('http://localhost:20004/api/countCostumersBySegment');
              const data = await response.json();
  
              // Verificando a estrutura dos dados
              const orderArray = data.Segments && data.Segments.Segment;
  
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
                    query Get_segment_counts {
                        get_segment_counts {
                            segment_name
                            customer_count
                        }
                    }
                `
            })
          });
        
          const data = await response.json();
          setGQLData(data.data.get_segment_counts);
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
                <li>Name: {data.name} Number of Customers: {data.number_of_customers}</li>
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
                <li>Name: {data.segment_name} Number of Customers: {data.customer_count}</li>
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

export default countCostumersBySegment;
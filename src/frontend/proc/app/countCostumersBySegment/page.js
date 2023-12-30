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
  
      fetchOrders();
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
              <li key={data.team}>{data.team}</li>
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
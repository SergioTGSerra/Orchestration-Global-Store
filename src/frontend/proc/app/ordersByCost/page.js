"use client";   
import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Container, FormControl, InputLabel, MenuItem, Select} from "@mui/material";
import { Diversity1 } from "@mui/icons-material";

function ordersByCost() {
  const [selectedMarket, setSelectedMarket] = useState("");
  const [selectedMarketGraph, setSelectedMarketGraph] = useState("");
  const [procData, setProcData] = useState(null);
  const [markets, setMarkets] = useState(null);
  const [marketsGql, setMarketsGql] = useState(null);
  const [gqlData, setGQLData] = useState(null);

  useEffect(() => {

    async function fetchMarkets() {
      try {
          const response = await fetch('http://localhost:20004/api/markets');
          const data = await response.json();

          // Verificando a estrutura dos dados
          const orderArray = data.Markets && data.Markets.Market;

          if (orderArray) {
            setMarkets(orderArray);
            console.log(orderArray);
          } else {
            console.error('Orders not found in the API response:', data);
          }
      } catch (error) {
          console.error('Error fetching orders:', error);
      }
    }

    async function fetchMarketsGQL() {
      try {
          const response = await fetch('http://localhost:20003/graphql', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
              body: JSON.stringify({
                  query: `
                  query Get_markets {
                    get_markets {
                        market_id
                        market_name
                    }
                }                
                  `
              })
          });
          const data = await response.json();
          setMarketsGql(data.data.get_markets);
      }
      catch (error) {
          console.error('Error fetching orders:', error);
      }
    }

    fetchMarkets();
    fetchMarketsGQL();
  }, []);

  if(selectedMarket){
    async function fetchOrders() {
      try {
          const response = await fetch('http://localhost:20004/api/ordersByCost/' + selectedMarket);
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
    fetchOrders();
  }

  if(selectedMarketGraph){
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
              query Get_orders_by_market {
                get_orders_by_market(market: "${selectedMarketGraph}") {
                    order_id
                    order_date
                    shipped_date
                    ship_mode
                    customer_name
                    shipping_cost
                    priority
                }
            }
              `
          })
        });

        const data = await response.json();
        setGQLData(data.data.get_orders_by_market);  
      } catch (error) {
          console.error('Error fetching orders:', error);
      }
    }

    fetchOrdersGQL();
  }

  return (
    <>
      <Container
        maxWidth="100%"
        sx={{
          backgroundColor: "white",
          padding: "2rem",
          borderRadius: "1rem",
          border: "solid thin black",
        }}
      >
        <Box>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Options</h2>
          <FormControl fullWidth>
            <InputLabel id="countries-select-label">Market</InputLabel>
            <Select
              labelId="countries-select-label"
              id="demo-simple-select"
              value={selectedMarket}
              label="Market"
              onChange={(e, v) => {
                setSelectedMarket(e.target.value);
              }}
            >
              <MenuItem value={""}>
                <em>None</em>
              </MenuItem>
              {markets &&
                markets.map((market) => (
                  <MenuItem key={market.id} value={market.id}>
                    {market.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Box>
        <br/>
        <Box>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Options</h2>
          <FormControl fullWidth>
            <InputLabel id="countries-select-label">Market</InputLabel>
            <Select
              labelId="countries-select-label"
              id="demo-simple-select"
              value={selectedMarketGraph}
              label="Market"
              onChange={(e, v) => {
                setSelectedMarketGraph(e.target.value);
              }}
            >
              <MenuItem value={""}>
                <em>None</em>
              </MenuItem>
              {marketsGql &&
                marketsGql.map((market) => (
                  <MenuItem key={market.market_id} value={market.market_id}>
                    {market.market_name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Box>
      </Container>

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
                <li key={data.id}>id: {data.id} Date: {data.date} Priority: {data.priority}</li>
              </div>              
            ))}
          </ul>
        ) : selectedMarket ? (
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
              <li key={data.order_id}>id: {data.order_id} Date: {data.order_date} Priority: {data.priority}</li>
            ))}
          </ul>
        ) : selectedMarketGraph ? (
          <CircularProgress />
        ) : (
          "--"
        )}
      </Container>
    </>
  );
}

export default ordersByCost;
import { React } from "react";
import {
  Container,
  CssBaseline,
  Avatar,
  Paper,
  Typography,
  Grid,
} from "@mui/material";
import algoliasearch from "algoliasearch/lite";
import { Hits, InstantSearch, Configure } from "react-instantsearch";
import SearchUsers from "./SearchUsers";
import { useHistory } from "react-router-dom";
import "../assets/styles.css";

const searchClient = algoliasearch(
  "96KKYAPG7L",
  "5363df1cce900c2fe807277a603abd7f"
);

function Hit({ hit }) {
  const history = useHistory();

  function goToProfile(username) {
    history.push(`/${username}`);
  }

  return (
    <Paper
      onClick={() => goToProfile(hit.username)}
      sx={{
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        margin: "10px",
        width: "300px",
        padding: 2,
      }}
    >
      <Avatar src={hit.profilePic} style={{ marginRight: "10px" }}></Avatar>
      <Typography style={{ marginRight: "10px" }}>{hit.displayName}</Typography>
      <Typography style={{ marginRight: "10px" }}>/ @{hit.username}</Typography>
    </Paper>
  );
}

function SearchPage() {
  return (
    <Container component="main" maxWidth="xs">
      <InstantSearch searchClient={searchClient} indexName="search_users">
        <Configure
          filters="deleted:false"
        />
        <CssBaseline />
        <Grid
          container
          direction="column"
          justifyContent="center"
          alignItems="center"
        >
          <Grid item alignSelf="center">
            <SearchUsers />
          </Grid>
          <Grid item alignContent="center">
            <Hits hitComponent={Hit} classNames={{ list: "custom-list" }} />
          </Grid>
        </Grid>
        <div style={{ marginBottom: "40px" }}></div>
      </InstantSearch>
    </Container>
  );
}

export default SearchPage;

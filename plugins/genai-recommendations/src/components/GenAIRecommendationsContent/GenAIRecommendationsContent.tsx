import React, { useState } from 'react';
import { Typography, Grid, Accordion, AccordionSummary, AccordionDetails, Button} from '@material-ui/core';
import {
  Content,
  ContentHeader,
} from '@backstage/core-components';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import CachedIcon from '@material-ui/icons/Cached';
import {
  useEntity
} from '@backstage/plugin-catalog-react';
import { useAsyncFn } from 'react-use';
import { Progress } from '@backstage/core-components';
import CodeMirror from '@uiw/react-codemirror';
import { tomorrowNightBlue } from "@uiw/codemirror-theme-tomorrow-night-blue";
import { javascript } from '@codemirror/lang-javascript';
import {
  useApi,
} from '@backstage/core-plugin-api';
import { genAIApiRef } from '../../../api';

export const GenAIRecommendationsTestContent = () => {
  const {entity} = useEntity()
  const genAIApi = useApi(genAIApiRef);
  const [{value: recommendations, loading, error}, listRecommendationsFn] = useAsyncFn(async () => {
    const response = await fetch('http://localhost:7007/api/proxy/genai-recommendations/unit_test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: entity.metadata.annotations && entity.metadata.annotations["github.com/project-slug"] ? `https://github.com/${entity.metadata.annotations["github.com/project-slug"]}` : ""
      })
    })
    const result = await response.json()
    return result
  }, [], {loading: false, error: undefined, value: []});

  const extensions = [javascript({typescript: true})];

  async function addTest(test) {
    try {
      const response = await genAIApi.pushNewTest({
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          entityRef: `${entity.kind}:${entity.metadata.namespace}/${entity.metadata.name}`,
          path: test.path,
          code: test.code
        })
      })
      console.log(response)
    } catch {
      // setRecommendations([])
    }
  }

  if (loading) return <Progress />

  return (
    <Content>
      <ContentHeader title={recommendations.length === 0 ? `Load new GenAI Recommendations` : `You have ${recommendations.length} GenAI Recommedations`}>
        <Button variant="contained" color="primary" startIcon={<CachedIcon />} onClick={listRecommendationsFn}>
          Reload
        </Button>
      </ContentHeader >
      <Grid container spacing={3} direction="column">
        {recommendations.map((test, i) => (
          <Accordion TransitionProps={{ unmountOnExit: true }} key={i}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography variant='button'>New Unit Test: {test.path}</Typography>
              <Grid container direction="row-reverse" spacing={2}>
                <Grid item>
                  <Button variant="contained" color="primary" onClick={() => addTest(test)}>
                    Accept
                  </Button>
                </Grid>
                <Grid item>
                  <Button variant="outlined" color="secondary">
                    Discard
                  </Button>
                  </Grid>
              </Grid>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container direction="row">
                <Grid item md={6}>
                  <Typography>Original</Typography>
                  <CodeMirror value={test.original} theme={tomorrowNightBlue} extensions={extensions} editable={false} />
                </Grid>
                <Grid item md={6}>
                  <Typography>Test</Typography>
                  <CodeMirror value={test.code} theme={tomorrowNightBlue} extensions={extensions}/>
                </Grid>
              </Grid>
            </AccordionDetails>
        </Accordion>
        ))}
      </Grid>
    </Content>
  )
}

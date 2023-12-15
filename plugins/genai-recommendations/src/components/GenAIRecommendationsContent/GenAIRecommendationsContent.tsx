import React, { useCallback, useState } from 'react';
import {v4 as uuidv4} from 'uuid';
import { Typography, Grid, Accordion, AccordionSummary, AccordionDetails, Button, Snackbar} from '@material-ui/core';
import {
  Content,
  ContentHeader,
  DismissableBanner,
  Link
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
import { Alert } from '@material-ui/lab';

export const GenAIRecommendationsTestContent = () => {
  const {entity} = useEntity()
  const genAIApi = useApi(genAIApiRef);
  const [{value: recommendations, loading: recommendationsLoading, error: recommendationsError}, listRecommendationsFn] = useAsyncFn(async () => {
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

  const [{value: addTestResult, loading: addTestLoading, error: addTestError}, addTest] = useAsyncFn(async (test, reset = false, code) => {
    if (reset) {
      return Promise.resolve(undefined);
    }
    const response = await genAIApi.pushNewTest({
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        entityRef: `${entity.kind}:${entity.metadata.namespace}/${entity.metadata.name}`,
        path: test.path,
        code: code
      })
    })
    return response
  }, []);

  const calculateAlert = () => {
    if(addTestResult) {
      return {
        status: "success",
        message: <Typography>Pull Request successfully created:{' '}<Link to={addTestResult.pr.data.html_url} color="white">{addTestResult.pr.data.html_url.replace("https://github.com/", "")}</Link></Typography>
      }
    } else if (addTestError) {
      return {
        status: "error",
        message: <Typography>Error creating Pull Request</Typography>
      }
    }
    return {
      status: "error",
      message: <Typography>Error</Typography>
    }
  }

  const alert = calculateAlert()

  if (recommendationsLoading) return <Progress />

  return (
    <Content>
      {addTestLoading ? <Progress /> : ""}
      <Snackbar open={!!addTestResult || !!addTestError} autoHideDuration={6000} anchorOrigin={{ vertical: "top", horizontal: "right" }} onClose={() => addTest({}, true)}>
          <Alert severity={alert.status} onClose={() => addTest({}, true)}>
              {alert.message}
          </Alert>
      </Snackbar>
      <ContentHeader title={recommendations.length === 0 ? `Load new GenAI Recommendations` : `You have ${recommendations.length} GenAI Recommedations`}>
        <Button variant="contained" color="primary" startIcon={<CachedIcon />} onClick={listRecommendationsFn}>
          Reload
        </Button>
      </ContentHeader >
      <Grid container spacing={3} direction="column">
        {recommendations && recommendations.map((test, i) => (
          <SingleRecommendation test={test} i={i} addTest={addTest} />
        ))}
      </Grid>
    </Content>
  )
}
function SingleRecommendation({test, i, addTest}) {
  const [code, setCode] = useState("")
  const onCodeChange = useCallback((val, viewUpdate) => {
    setCode(val);
  }, []);
  const extensions = [javascript({typescript: true})];
  return (
    <Accordion TransitionProps={{ unmountOnExit: true }} key={i}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <Typography variant='button'>New Unit Test: {test.path}</Typography>
        <Grid container direction="row-reverse" spacing={2}>
          <Grid item>
            <Button variant="contained" color="primary" onClick={() => addTest(test, false, code)}>
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
            <CodeMirror value={test.code} theme={tomorrowNightBlue} extensions={extensions} onChange={onCodeChange} />
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  )
}
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
import useAsync from 'react-use/lib/useAsync';
import { Progress } from '@backstage/core-components';
import CodeMirror from '@uiw/react-codemirror';
import { tomorrowNightBlue } from "@uiw/codemirror-theme-tomorrow-night-blue";
import { javascript } from '@codemirror/lang-javascript';
import {
  DiscoveryApi,
  FetchApi,
  IdentityApi,
  useApi,
} from '@backstage/core-plugin-api';
import { genAIApiRef } from '../../../api';

export const GenAIRecommendationsTestContent = () => {
  const {entity} = useEntity()
  const genAIApi = useApi(genAIApiRef);
  // const backendUrl = config.getString('backend.baseUrl')
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<any>({})

  const extensions = [javascript({typescript: true})];

  async function loadGenAIRecommendations () {
    try {
      // const responseRaw = await fetch('/api/proxy/genai-recommendations/unit_test', {
      setLoading(true)
      const responseRaw = await fetch('http://localhost:7007/api/proxy/genai-recommendations/unit_test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: entity.metadata.annotations && entity.metadata.annotations["github.com/project-slug"] ? `https://github.com/${entity.metadata.annotations["github.com/project-slug"]}` : ""
        })
      })

      const response = await responseRaw.json()

      setRecommendations(response)
      setLoading(false)
    } catch {
      setRecommendations([])
    }
  }

  async function addTest(test) {
    try {
      // const responseRaw = await fetch('/api/proxy/genai-recommendations/unit_test', {
      // setLoading(true)
      // const responseRaw = await fetch('http://localhost:7007/api/genai/health', {
      //   method: 'GET',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   // body: JSON.stringify({
      //   //   url: entity.metadata.annotations && entity.metadata.annotations["github.com/project-slug"] ? `https://github.com/${entity.metadata.annotations["github.com/project-slug"]}` : ""
      //   // })
      // })

      // const response = await responseRaw.json()
      console.log(entity)
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

      // setRecommendations(response)
      // setLoading(false)
    } catch {
      // setRecommendations([])
    }
  }

  if (loading) return <Progress />

  return (
    <Content>
      <ContentHeader title={recommendations.length === 0 ? `Load new GenAI Recommendations` : `You have ${recommendations.length} GenAI Recommedations`}>
        <Button variant="contained" color="primary" startIcon={<CachedIcon />} onClick={loadGenAIRecommendations}>
          Reload
        </Button>
        <Button variant="contained" color="primary" >
                    Accept
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

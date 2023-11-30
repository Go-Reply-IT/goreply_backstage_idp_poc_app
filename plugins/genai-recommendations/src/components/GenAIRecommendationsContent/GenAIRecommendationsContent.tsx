import React, { PropsWithChildren, useState } from 'react';
import { Typography, Grid, Accordion, AccordionSummary, AccordionDetails, Button, Stack, AppBar, Tabs, Tab } from '@material-ui/core';
import {
  InfoCard,
  Header,
  Page,
  Content,
  ContentHeader,
  HeaderLabel,
  SupportButton,
  TabbedLayout,
} from '@backstage/core-components';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import CachedIcon from '@material-ui/icons/Cached';
import { CopyBlock, tomorrowNightBlue } from 'react-code-blocks';
import {
  useEntity
} from '@backstage/plugin-catalog-react';
import useAsync from 'react-use/lib/useAsync';
import { Table, TableColumn, Progress, ResponseErrorPanel } from '@backstage/core-components';
import { TabContext, TabPanel } from '@material-ui/lab';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

export const GenAIRecommendationsContent = () => {
  const {entity} = useEntity()
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<any>({})

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

  if (loading) return <Progress />
  // else if (error) return <ResponseErrorPanel error={error} />

  return (
    <Content>
      <ContentHeader title={recommendations.length === 0 ? `Load new GenAI Recommendations` : `You have ${recommendations.length} GenAI Recommedations`}>
        <Button variant="contained" color="primary" startIcon={<CachedIcon />} onClick={loadGenAIRecommendations}>
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
                  <Button variant="contained" color="primary">
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
                  <CopyBlock
                    text={test.original}
                    language={"typescript"}
                    showLineNumbers={true}
                    theme={tomorrowNightBlue}
                    codeBlock
                  />
                </Grid>
                <Grid item md={6}>
                  <Typography>Test</Typography>
                  <CopyBlock
                    text={test.code}
                    language={"typescript"}
                    showLineNumbers={true}
                    theme={tomorrowNightBlue}
                    codeBlock
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
        </Accordion>
        ))}
      </Grid>
    </Content>
  )
}

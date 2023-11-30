import React from 'react';
import { Typography, Grid, Accordion, AccordionSummary, AccordionDetails } from '@material-ui/core';
import {
  InfoCard,
  Header,
  Page,
  Content,
  ContentHeader,
  HeaderLabel,
  SupportButton,
} from '@backstage/core-components';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { CopyBlock, tomorrowNightBlue } from 'react-code-blocks';
import {
  useEntity
} from '@backstage/plugin-catalog-react';

export const GenAIRecommendationsContent = () => {
  const {entity} = useEntity()

  const response = [
    {
      path: "src/component/Test.ts",
      reason: "",
      code: `function toBe() {
    if (Math.random() < 0.5) {
      return true;
    } else {
      return false;
    }
  }`
    },
    {
      path: "src/component/Test.ts",
      reason: "",
      code: `function toBe() {
    if (Math.random() < 0.5) {
      return true;
    } else {
      return false;
    }
  }`
    },
    {
      path: "src/component/Test.ts",
      reason: "",
      code: entity.metadata.annotations && entity.metadata.annotations["github.com/project-slug"] ? `https://github.com/${entity.metadata.annotations["github.com/project-slug"]}` : "No Repo"
    },
  ]

  return (
    <Content>
      <ContentHeader title={`You have ${response.length} GenAI Recommedations`} />
      <Grid container spacing={3} direction="column">
        {response.map((test, i) => (
          <Accordion TransitionProps={{ unmountOnExit: true }} key={i}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography variant='button'>New Unit Test: {test.path}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <CopyBlock
                text={test.code}
                language={"javascript"}
                showLineNumbers={true}
                theme={tomorrowNightBlue}
                codeBlock
              />
            </AccordionDetails>
        </Accordion>
        ))}
      </Grid>
    </Content>
  )
}

import {
  Container,
  Multiselect,
  SpaceBetween,
  FormField,
  Input,
  Grid, 
  Table
} from '@awsui/components-react';

import React, { useState, useEffect } from 'react';


function App() {
  const [filterPhotos, setFilterPhotos] = useState([]);
  const [allPhotos, setAllPhotos] = useState([]);
  const [allDropdownLabels, setAllDropdownLabels] = useState([]);
  const [filteredDropdownLabels, setFilteredDropdownLabels] = useState([]);
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [imageLabels, setImageLabels] = useState([]);
  const [minConfidence, setMinConfidence] = useState(55);

  useEffect(() => {
    fetch('./data.json')
      .then((res) => res.json())
      .then((result) => {
        dataLoaded(result);
      });
  }, []);

  const onChange = (event) => {
    if (!Number.isInteger(Number(event.detail.value))) {
      return;
    }
    setMinConfidence(event.detail.value);

    const uniqueLabels = [...new Set(allDropdownLabels.filter(l => l.confidence >= parseInt(event.detail.value)).flatMap(l => (l.parents.length) ? l.parents.map(p => `${p.Name}:${l.name}`) : [l.name]))].sort();
    setFilteredDropdownLabels(uniqueLabels.map(l => {
      return {
        label: l,
        value: l
      }
    }));
  };


  function dataLoaded(result) {
    setAllPhotos(result);
    setFilterPhotos(result);

    // flatten / unique the labels
    const labelsParents = result.flatMap((photo) => photo.Labels.map(l => {
      return { name: l.Name, parents: l.Parents, confidence: l.Confidence };
    }));
    setAllDropdownLabels(labelsParents);

    const uniqueLabels = [...new Set(labelsParents.flatMap(l => (l.parents.length) ? l.parents.map(p => `${p.Name}:${l.name}`) : [l.name]))].sort();
    setFilteredDropdownLabels(uniqueLabels.map(l => {
      return {
        label: l,
        value: l
      }
    }));
  }

  function selectedChanged(event) {
    setSelectedLabels(event.detail.selectedOptions);
    if (event.detail.selectedOptions.length === 0) {
      setFilterPhotos(allPhotos);
      return;
    }

    const selected = event.detail.selectedOptions.map(option => option.value.split(":").slice(-1)[0]);
    const filterPhotos = allPhotos.filter((photo) => {
      const labels = photo.Labels.map(l => l.Name);
      return labels.some(l => selected.includes(l));
    });
    setFilterPhotos(filterPhotos);
  }

  function handleMouseEnter(event, filename) {
    const filter = (minConfidence != '' ) ? parseInt(minConfidence) : 0;
    const photo = allPhotos.filter(p => p.Filename === filename)[0];
    const selected = selectedLabels.map(option => option.value);
    const labels = photo.Labels.filter(l => l.Confidence >= filter).flatMap(l => {
      return (l.Parents.length) ?  l.Parents.map(p => { return { label: `${p.Name}:${l.Name}`, confidence: l.Confidence.toFixed(1)}}) : [ { label: `${l.Name}`, confidence: l.Confidence.toFixed(1)}];
    }).map(l => {return {...l, highlight: selected.includes(l.label)}});
    setImageLabels(labels);
  }

  function handleMouseLeave(event) {
    setImageLabels([]);
  }


  return (
    <div>
      <Grid gridDefinition={[
        { colspan: { default: 2 } },
        { colspan: { default: 8 } },
        { colspan: { default: 2 } },
      ]}>
        <Container>
          <SpaceBetween size="l">
          <FormField
          label="Min Confidence"
          description="Exclude labels below the confidence threshold."
          >
          <Input
            onChange={(event) => onChange(event)}
            value={minConfidence}
            />
        </FormField>
        <FormField
          label="Labels"
          description={`Select from ${filteredDropdownLabels.length} labels.`}
          >
          <Multiselect filteringType="auto" options={filteredDropdownLabels}
            selectedOptions={selectedLabels}
            onChange={(event) => selectedChanged(event)}>
          </Multiselect>
          </FormField>
          </SpaceBetween>
        </Container>
        <Container>

          {filterPhotos.map((item) => (
            <span key={item.Filename} style={{ padding: '5px' }}>
              <img onMouseEnter={(event) => handleMouseEnter(event, item.Filename)} onMouseLeave={(event) => handleMouseLeave(event)} width="250" src={item.Filename} alt=""></img>
            </span>
          ))}
        </Container>

        <Table
        empty={
          <span>no labels</span>
        }
          columnDefinitions={[
            {
              id: "label",
              header: "Label",
              cell: e => e.highlight ? <b>{e.label}</b> : <span>{e.label}</span>
            },
            {
              id: "confidence",
              header: "Confidence",
              cell: e => e.confidence
            }  
          ]}
              items={imageLabels}>
          
        </Table>
      </Grid>
    </div>

  );
}

export default App;

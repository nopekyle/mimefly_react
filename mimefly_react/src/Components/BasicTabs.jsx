import React, {useState} from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import ProfileAnswers from './ProfileAnswers';
import ProfileQuestions from './ProfileQuestions';
import ProfileComments from './ProfileComments';

export default function BasicTabs({uid}) {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          TabIndicatorProps={{ style: { backgroundColor: '#00a8f3' } }}
          value={value}
          onChange={handleChange}
          aria-label="profile tabs"
          variant="fullWidth"
        >
          <Tab style={{ color: '#00a8f3' }} label="Answers" />
          <Tab style={{ color: '#00a8f3' }} label="Questions" />
          <Tab style={{ color: '#00a8f3' }} label="Comments" />
        </Tabs>
      </Box>
      {value === 0 && <ProfileAnswers uid={uid} />}
      {value === 1 && <ProfileQuestions uid={uid} />} 
      {value === 2 && <ProfileComments uid={uid} />} 
    </Box>
  );
}
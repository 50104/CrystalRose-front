import React from 'react';
import Test from '../../Test';
import RoseRanking from './RoseRanking';
import RoseReview from './RoseReview.js';
import RoseToday from './RoseToday';

function Home() {
  return (
    <div>
      <Test />
      {/*  */}
      <RoseRanking />
      <RoseReview />
      <RoseToday />
    </div>
  );
}

export default Home;
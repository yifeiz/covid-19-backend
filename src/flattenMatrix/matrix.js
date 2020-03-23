const matrix = {
  "1y2y4y5y6y7y": 1,
  "1y2y4y5y6y7n": 1,
  "1y2y4y5y6n7y": 1,
  "1y2y4y5y6n7n": 1,
  "1y2y4y5n6y7y": 1,
  "1y2y4y5n6y7n": 1,
  "1y2y4y5n6n7y": 3,
  "1y2y4y5n6n7n": 3,
  "1y2y4n5y6y7y": 1,
  "1y2y4n5y6y7n": 1,
  "1y2y4n5y6n7y": 3,
  "1y2y4n5y6n7n": 3,
  "1y2y4n5n6y7y": 1,
  "1y2y4n5n6y7n": 1,
  "1y2y4n5n6n7y": 1,
  "1y2y4n5n6n7n": 1,
  "1y2n4y5y6y7y": 5,
  "1y2n4y5y6y7n": 5,
  "1y2n4y5y6n7y": 5,
  "1y2n4y5y6n7n": 3,
  "1y2n4y5n6y7y": 5,
  "1y2n4y5n6y7n": 5,
  "1y2n4y5n6n7y": 5,
  "1y2n4y5n6n7n": 3,
  "1y2n4n5y6y7y": 4,
  "1y2n4n5y6y7n": 4,
  "1y2n4n5y6n7y": 3,
  "1y2n4n5y6n7n": 7,
  "1y2n4n5n6y7y": 5,
  "1y2n4n5n6y7n": 5,
  "1y2n4n5n6n7y": 6,
  "1y2n4n5n6n7n": 7,
  "1n2y4y5y6y7y": 5,
  "1n2y4y5y6y7n": 5,
  "1n2y4y5y6n7y": 6,
  "1n2y4y5y6n7n": 7,
  "1n2y4y5n6y7y": 5,
  "1n2y4y5n6y7n": 5,
  "1n2y4y5n6n7y": 5,
  "1n2y4y5n6n7n": 7,
  "1n2y4n5y6y7y": 5,
  "1n2y4n5y6y7n": 5,
  "1n2y4n5y6n7y": 5,
  "1n2y4n5y6n7n": 6,
  "1n2y4n5n6y7y": 5,
  "1n2y4n5n6y7n": 5,
  "1n2y4n5n6n7y": 6,
  "1n2y4n5n6n7n": 4,
  "1n2n4y5y6y7y": 5,
  "1n2n4y5y6y7n": 5,
  "1n2n4y5y6n7y": 5,
  "1n2n4y5y6n7n": 4,
  "1n2n4y5n6y7y": 5,
  "1n2n4y5n6y7n": 5,
  "1n2n4y5n6n7y": 5,
  "1n2n4y5n6n7n": 4,
  "1n2n4n5y6y7y": 5,
  "1n2n4n5y6y7n": 5,
  "1n2n4n5y6n7y": 5,
  "1n2n4n5y6n7n": 4,
  "1n2n4n5n6y7y": 5,
  "1n2n4n5n6y7n": 5,
  "1n2n4n5n6n7y": 5,
  "1n2n4n5n6n7n": 4
};

const responses = require("./response.json");

exports.getResponseFromScore = score => {
  const response = responses[score];
  if (score === 2 || score === 4) {
    return response;
  }
  if (score === 1 || score === 3) {
    return response.concat(responses.hospitals, responses.recommendations);
  }
  if (score === 5 || score === 6 || score === 7) {
    return response.concat(responses.recommendations);
  }

  throw new Error(`${score} is not a valid score.`);
};

exports.getScoreFromAnswers = ans => {
  if (ans.q3 === "y") {
    return 2;
  }
  const encodedAnswers = `1${ans.q1}2${ans.q2}4${ans.q4}5${ans.q5}6${ans.q6}7${ans.q7}`;
  return matrix[encodedAnswers];
};

exports.atRisk = ans => {
  if (ans.q4 === "y" || ans.q5 === "y") {
    return true;
  }
  return false;
};

exports.probable = ans => {
  console.log(ans);

  if (ans.q3 === "y") {
    return true;
  }
  if (ans.q1 === "y") {
    if (ans.q2 === "y") {
      return true;
    }
    if (ans.q6 === "y") {
      return true;
    }
  }
  if (ans.q6 === "y") {
    if (ans.q2 === "y") {
      return true;
    }
    if (ans.q3 === "y") {
      return true;
    }
  }
  if (ans.q7 === "y") {
    return true;
  }

  return false;
};

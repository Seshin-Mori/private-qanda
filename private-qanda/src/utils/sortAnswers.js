export const sortAnswersByTimestamp = (answers) => {
  return answers.sort((a, b) => a.createdAt.seconds - b.createdAt.seconds);
};

const util = {};

util.getGroupName = groupIndex => {
  if (groupIndex === 0) return 'New words';
  if (groupIndex === 1) return 'Repeated 1 time';
  if (groupIndex < 10) {
    return 'Repeated ' + groupIndex + ' times';
  }
  return 'Learnt';
};
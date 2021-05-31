import capitaliseFirst from '@utilties/capitaliseFirst';

export default function titleCase(str) {
  return str.split(' ').map(str => capitaliseFirst(str)).join(' ');
}

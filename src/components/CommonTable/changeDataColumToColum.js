export default function (columns){

  const action = columns.findIndex((col)=>col.dataIndex === 'action');
  const selection = columns.findIndex((col)=>col.title === 'selection');
  const index = columns.findIndex((col)=>col.title === '序号');
}

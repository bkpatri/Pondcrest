export function parseCSV(input:string):Record<string,string>[] {
 const text=input.replace(/^\uFEFF/,'');const rows:string[][]=[];let row:string[]=[],field='',quoted=false;
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(c==='"'){if(quoted&&text[i+1]==='"'){field+='"';i++;}else quoted=!quoted;}
  else if(c===','&&!quoted){row.push(field);field='';}
  else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(field);if(row.some(Boolean))rows.push(row);row=[];field='';}
  else field+=c;
 }
 if(quoted)throw Error('The CSV has an unclosed quoted field.');
 if(field||row.length){row.push(field);if(row.some(Boolean))rows.push(row);}
 const headers=rows.shift();if(!headers)throw Error('The CSV is empty.');
 for(const h of ['Name','Code','Description','Easting','Northing','Point photos'])if(!headers.includes(h))throw Error('The CSV is missing the '+h+' column.');
 return rows.map((values,index)=>{if(values.length!==headers.length)throw Error('The CSV has an incorrect column count on row '+(index+2)+'.');return Object.fromEntries(headers.map((h,i)=>[h,values[i]]));});
}

const rp = require('request-promise'),
    cheerio = require('cheerio').
    {to} = require('await-to-js');
    
let options = {
  uri: 'https://nifa.usda.gov/abstracts-funded-sbir-projects',
  transform: body => cheerio.load(body)
};

let results = [],
    err;
    
rp(options)
.then(async $ => {
let rows = $('table tbody tr');
for (let i = 0; i< rows.length; i++){
  let category,
  abstracts = [],
  links = [];
  
  let rowTableColumns = rows.eq(i).find('td');
  for (let j =0; j < rowTableColumns.length; j++){
      if(!j){
        category = rowTableColumns.eq(j).text().trim();
      }
      else{
        links.push(rowTableColumns.eq(j).find('a').attr('href'));
      }
  }
  
  const getAbstracts = async () => {
    return new Promise(async (resolve, reject) => {
      let uri = links.pop(),
         $$;
         
       console.log('getting abstract for ' + uri);
       options = {...options, ...{uri}};
       [err, $$] = await to(rp(options));
       if (err) return reject(err);
       
       let abstractRows = $$('.tablealternativebg');
       for(let k=0; k < abstractRows.length; k++){
        let title,
        briefLink;
        let abstractRowColumns = abstractRows.eq(k).find('td');
        
        for (let l = 0; l < abstractRowColumns.length; l++){
          if(!l){
            title = abstractRowColumns.eq(l).text
          }
          else if (l === 4){
            briefLink = abstractRowColumns.eq(l).find('a').eq(0).attr('href'); // brief on top and full below
            
            let $$$;
            console.log('getting brief link for ' + briefLink);
                   options = {...options, ...{uri: briefLink}};
                   [err, $$$] = await to(rp(options));
                   if (err) return reject(err);
                   
                   let briefColumns = $$$('table tbody tr');
                   for (let m = 0; m < briefColumns.length; m++){
                   if(m === 5) {
                    console.log(briefColumns.eq(m).text());
                   }
                   }
          }
        }
        abstracts.push({title, briefLink});
       }
      if(!links.length){
      return resolve();
      }
    })
  }
  
  console.log('getting abstracts for ' + category);
  [err, _] = await to(getAbstracts());
  if(err) {
    console.error(err);
    process.exit();
  }
  
  console.log(abstracts);
  process.exit();
}
})
.catch(err => {
console.error(err); 
process.exit();
})

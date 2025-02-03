export async function viewHomeRun(user:any,pb:any,play_id:string){
  const data = {
    "play_id": play_id,
    "user": user.id
  };
  const record = await pb.collection('watch_history').create(data);
  return !!record
}

export async function getWatchedVideos(user:any,pb:any){
  try{
    const records = await pb.collection('watch_history').getFullList({ filter: `user="${user.id}"` })
    return records ? records : []
  }
  catch (e) {
    console.log(e)
    return []
  }
}

export async function likeHomeRun(user:any,pb:any,play_id:string){
try {
  const record = await pb.collection('liked_home_runs').getFirstListItem(`user=${user.id}&&play_id=${play_id}`);
  if (record) {
    return true
  }
}catch (e) {
  console.log(e)
  return false
}

  try{
    const data = {
      'play_id': play_id,
      'user': user.id,
    }
    const record = await pb.collection('liked_home_runs').create(data)
    return !!record
  }catch (e) {
    console.log(e)
    return false
  }
}


export async function createPageRecord(page:number,user:any,pb:any){
  try{
    const data = {
      'page': page,
      'user': user.id,
    }
    const record = await pb.collection('page').create(data)
    return !!record
  }catch (e) {
    console.log(e)
    return false
  }
}

export async function getCurrentPage(user:any,pb:any){
  try{
    const record = await pb.collection('page').getFirstListItem(`user="${user.id}"`)
    console.log(record)
    if (!record){
      await createPageRecord(1,user,pb)
    }
    return record ? record.page : 1
  }catch (e) {
    console.log(e)
    await createPageRecord(1,user,pb)
    return 1
  }
}

export async function updatePageRecord(page:number,user:any,pb:any){
  try{
    const record = await pb.collection('page').getFirstListItem(`user="${user.id}"`)
    if (record){
      await pb.collection('page').update(record.id,{page:page})
      return true
    }
    await createPageRecord(page, user, pb)
    return false
  }catch (e) {
    console.log(e)
    return false
  }
}

export async function handlePageUpdate(page:number,user:any,pb:any){
  getCurrentPage(user,pb).then((currentPage)=>{
    if (!currentPage){
      createPageRecord(page,user,pb)
    }
    if (currentPage!==page){
      updatePageRecord(page,user,pb)
    }
  })
}


export async function getIsLiked(play_id:string,user:any,pb:any){
  try{
    const record = await pb.collection('liked_home_runs').getFirstListItem(`user="${user.id}"&&play_id="${play_id}"`);
    return !!record
  }catch (e) {
    console.log(e)
    return false
  }
}

export async function likeHomeRunVideo(user:any,pb:any,play_id:string){
  try{
    const data = {
      'play_id': play_id,
      'user': user.id,
    }
    const record = await pb.collection('liked_home_runs').create(data)
    return !!record
  }catch (e) {
    console.log(e)
    return false
  }
}


export async  function unlikeHomeRunVideo(user:any,pb:any,play_id:string){
  try{
    const record = await pb.collection('liked_home_runs').getFirstListItem(`user="${user.id}"&&play_id="${play_id}"`);
    if (record){
      await pb.collection('liked_home_runs').delete(record.id)
      return true
    }
    return false
  }catch (e) {
    console.log(e)
    return false
  }
}



export async function getIsBookmark(play_id:string,user:any,pb:any){
  try{
    const record = await pb.collection('bookmark').getFirstListItem(`user="${user.id}"&&play_id="${play_id}"`);
    return !!record
  }catch (e) {
    console.log(e)
    return false
  }
}

export async function bookmarkHomeRunVideo(user:any,pb:any,play_id:string){
  try{
    const data = {
      'play_id': play_id,
      'user': user.id,
    }
    const record = await pb.collection('bookmark').create(data)
    return !!record
  }catch (e) {
    console.log(e)
    return false
  }
}

export async  function unbookmarkHomeRunVideo(user:any,pb:any,play_id:string){
  try{
    const record = await pb.collection('bookmark').getFirstListItem(`user="${user.id}"&&play_id="${play_id}"`);
    if (record){
      await pb.collection('bookmark').delete(record.id)
      return true
    }
    return false
  }catch (e) {
    console.log(e)
    return false
  }
}


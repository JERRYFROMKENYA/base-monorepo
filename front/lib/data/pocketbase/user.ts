export async function UpdateUser(user:any,pb:any,data:any){
  try {
    let userRes = await pb.collection('user').update(user.id, data)
  } catch (e) {
    console.error('Error updating user:', e)
  }

}
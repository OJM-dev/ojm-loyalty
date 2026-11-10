'use strict';
// Serialises writes and uses the server's revision trigger to detect stale tabs.
class LoyaltyStore {
  constructor(client,userId,onStatus=()=>{}) {this.client=client;this.userId=userId;this.onStatus=onStatus;this.revision=null;this.pending=null;this.running=null;this.conflict=false;this.error=null;this.closed=false;}
  async load(){const {data,error}=await this.client.from('loyalty_workspaces').select('data,revision').eq('user_id',this.userId).maybeSingle();if(error)throw error;this.revision=data?data.revision:null;return data?.data??null;}
  queue(value){if(this.closed)return;this.pending=JSON.parse(JSON.stringify(value));this.onStatus('Saving…');this.flush().catch(()=>{});}
  flush(){if(this.running)return this.running;if(this.closed)return Promise.reject(Error('Signed out'));if(this.conflict)return Promise.reject(Error('Conflict'));this.running=this.writeLoop().finally(()=>{this.running=null;});return this.running;}
  async writeLoop(){this.error=null;while(this.pending&&!this.closed){const snapshot=this.pending;this.pending=null;try{let response;if(this.revision===null){response=await this.client.from('loyalty_workspaces').insert({user_id:this.userId,data:snapshot}).select('revision').single();}else{response=await this.client.from('loyalty_workspaces').update({data:snapshot}).eq('user_id',this.userId).eq('revision',this.revision).select('revision').maybeSingle();}if(response.error){if(response.error.code==='23505')this.conflict=true;throw response.error;}if(!response.data){this.conflict=true;throw Error('Newer data exists in another tab.');}this.revision=response.data.revision;}catch(error){if(!this.pending)this.pending=snapshot;this.error=error;this.onStatus(this.conflict?'Newer data found — review before saving':'Not saved — retry or download a backup');throw error;}}if(!this.closed)this.onStatus('Saved to Supabase');}
  get dirty(){return !!this.pending||!!this.running;}
  close(){this.closed=true;this.pending=null;}
}
if(typeof module!=='undefined')module.exports={LoyaltyStore};

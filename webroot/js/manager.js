$(function(){
	function getUrlParams(){
		let uri = window.location.href.split('?');
	    if (uri.length == 2)
	    {
	      let vars = uri[1].split('&');
	      let getVars = {};
	      let tmp = '';
	      vars.forEach(function(v){
	        tmp = v.split('=');
	        getVars[tmp[0]] = tmp[1];
	      });
	      return getVars
	    }
	    return {}
	}

	poll = new Vue({
		el:"main",
		data:{
			api: "/api/1.0",
			menu: [],
			teams: [],
			player: {},
			pages: {index:'index', mate:'mate', team:'team', sets:'sets'},
			page: '',
			title: '',
			d: {},
		},
		created:function(){
			params = getUrlParams()
			this.goIndex();
			this.player = {id:params.id}
			this.getTeams()
			
		},
		methods:{
			/* Navigation functions */
			goTeam: function(id){
				if(id == -1){
					this.goIndex();
					return;
				}
				// TODO récupérer tous les sets de toutes les tems une bonne fois pour toutes
				this.getSets(id).then(_ => {
					this.d.sums = []
					this.page = this.pages.team
					this.title = 'Team '+ id

					// TODO les sommes ne fonctionnent pas
					for (mate_id in this.d.team){
						mate=this.d.team[mate_id]

						i=0
						this.d.sums[mate.name]=[]
						for (dungeon_id in this.d.dungeon){
							dungeon= this.d.dungeon[dungeon_id]
							sum=0
							concat=[]
							for (item_id in mate.set){
								item=mate.set[item_id]
								console.log(item)
								for (drop_id in dungeon.drop){
									drop= dungeon.drop[drop_id]
									if (drop.type == item.type && item.name.match(/.*Diamond.*/i)) {
										sum += drop.amount;
										concat.push(drop.type)
									}
								}
							}
							this.d.sums[mate.name][i] = sum
							this.d.sums[mate.name][i+1] = concat.join(", ");
							i+=2
						}
					}
					console.log(this.d.sums)
				})
			},
			goIndex: function(){
				this.page=this.pages.index
				this.title="Loading"
			},
			goPlayer: function(){
				this.page = this.pages.mate
				this.title = 'Mate'
			},
			goSet: function(playerName){
				this.page = this.pages.sets
				this.title = playerName+"'s sets"
				for (mate_id in this.d.team){
					mate=this.d.team[mate_id]
					if(mate.name==playerName){
						this.d.items=mate.set
					}
				}
			},

			/* Data fetch functions */
			getTeams: function(){
				$.get(this.api + '/teams/' + this.player.id, data => {
					this.teams = data
					this.refresh()
				})
			},
			getSets: function(id){
				tab = ["Deltascape O1S","Deltascape O2S","Deltascape O3S","Deltascape O4S"]
				promises=[];
				for (i in tab) {
					promises.push(
		                new Promise(function(resolve, reject) {
							$.get("/api/1.0/instance/"+tab[i], function(data){
								resolve(data);
							})
						})
					)
				}

				return new Promise((resolve, reject)=>{
					Promise.all(promises).then(saves => {
						$.get("/api/1.0/fullteam/"+id, data => {
							this.d.team = data;
							resolve()
						})
				        this.d.dungeon = saves
					})
				})				
			},

			/* Data contruction functions */
			refresh: function(){
				teams = []
				for(team_id in this.teams){
					team = this.teams[team_id]
					teams.push({text: team.name, value: team.team_id})
				}

				this.menu = [
					{function: this.goTeam, text:"My teams", default:-1, menu: teams},
				]

			},
		}
	})
});

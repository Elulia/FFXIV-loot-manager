function setPopover(){
	$('[data-toggle="popover"]').popover();
}
$(function(){
	poll = new Vue({
		el:"main",
		data:{
			data:[],
			sums:{test:'t'},
		},
		created:function(){
			tab = ["Deltascape O1S","Deltascape O2S","Deltascape O3S","Deltascape O4S"]
			promises=[];
			for (i in tab) {
				promises.push(
	                new Promise(function(resolve, reject) {
						$.get("/api/1.0//instance/"+tab[i], function(data){
							console.log(data);
							resolve(data);
						})
					})
				)
			}
	        team_promise = new Promise(function(resolve,reject){
				$.get("/api/1.0/fullteam/37", function(data){
					console.log(data);
					resolve(data);
				})
			})
			
			Promise.all(promises).then(saves => {
				team_promise.then(save => {
		            save.dungeon = saves
		            console.log(save)
		            this.affiche(save)
		        })
			})
			
		},
		methods:{
			affiche: function(data){
				this.data = data;
				for (mate_id in data.team){
					mate=data.team[mate_id]

					i=0
					this.sums[mate.name]=[]
					for (dungeon_id in data.dungeon){
						dungeon= data.dungeon[dungeon_id]
						sum=0
						concat=[]
						for (item_id in mate.set){
							item=mate.set[item_id]
							for (drop_id in dungeon.drop){
								drop= dungeon.drop[drop_id]
								if (drop.name == item.Type) {
									sum += parseInt(drop.amount);
									concat.push(drop.name)
								}
							}
						}
						this.sums[mate.name][i] = sum
						this.sums[mate.name][i+1] = concat.join(", ");
						i+=2
					}
				}
				console.log(this.sums)	
			}
		}
	})

	

});

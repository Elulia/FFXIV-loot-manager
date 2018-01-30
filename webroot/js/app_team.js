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
			$.get("http://localhost:8081/team", this.affiche)
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
									sum += parseInt(drop.price);
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

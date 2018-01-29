function setPopover(){
	$('[data-toggle="popover"]').popover();
}
$(function(){
	poll = new Vue({
		el:"main",
		data:{
			data:[],
					
		},
		created:function(){
			$.get("data.json", this.affiche)
		},
		methods:{
			affiche: function(data){
				this.data = data;
				for (mate_id in data.team){
					mate=data.team[mate_id]
					if(mate.name=="Elulia"){
						this.data=mate.set
					}
				}				
			}
		}
	})

});

function setPopover(){
	$('[data-toggle="popover"]').popover();
}
$(function(){
	form = new Vue({
		el:"main",
		data:{
			data:[],
			players:[],
					
		},
		created:function(){
			$.get("/api/1.0/class", this.gotClass);
			
		},
		methods:{
			gotClass: function(data){
				this.data = data;				
			},
			addPlayer:function(){
				this.players.push({name:"",class:""});
			},
			newTeam: function(){
				$.post("/api/1.0/team")
				return false
			},
			newSet: function(){
				values = $('#link').val().split('/')
				$.post("/api/1.0/set", {link:values[values.length-1]});
			}
		}
	})
});
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
			$.get("http://localhost:8081/class", this.gotClass);
			
		},
		methods:{
			gotClass: function(data){
				this.data = data;				
			},
			addPlayer:function(){
				this.players.push({name:"",class:""});
			},
			newTeam: function(){
				$.post("http://localhost:8081/team")
			},
			newSet: function(){
				$.post("http://localhost:8081/set", {link:$('#link').val()});
			}
		}
	})
});
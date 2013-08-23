sh.service('currentTime', function() {

    this.now = new Date();
    setInterval(updateTime, 1000)

    function updateTime() {
    	this.now = new Date();
    };
});
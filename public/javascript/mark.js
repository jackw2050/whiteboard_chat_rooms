function myFunction() {
    var x = document.getElementById("mySelect").selectedIndex;
    // console.log(x);
    if (x == 3) {
        var room_name = "Private" + Math.floor((Math.random() * 100000) + 1);
        document.getElementById('room_name').value = room_name;
        console.log(room_name);
    }
    
    elseif(x == 4) {
        var room_name = "Private" + document.getElementById('room_to_join').value;
        document.getElementById('room_name').value = room_name;
        console.log(room_name);
    }
    else {
        document.getElementById('room_name').value = document.getElementsByTagName("option")[x].value;
        console.log(document.getElementsByTagName("option")[x].value);
    }

}

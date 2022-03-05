var alphanumeric = ["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","AA", "AB", "AC", "AD", "AE", "AF", "AG", "AH"],
    res = "";

for(var x=0; x<30; x++) {
    if(res) {
        res += " + ";
    }
    res += alphanumeric[13 + x] + "2*IRef!$" + alphanumeric[10 + x] + "$1";
}

console.log(res);
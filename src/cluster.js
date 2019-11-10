//Encodings----
//age - x-axis
//total dosage - y-axis
//gender - shape
//T-category - size
//patients baseline info for a single symptom
//three categories based on severity
//0-3  4-6  7-10

var width = 400;
var height = 400;
var padding = 20;

var margin = {top: 10, right: 30, bottom: 30, left: 60};
    width = 460 - margin.left - margin.right;
    height = 400 - margin.top - margin.bottom;


function search_for_age(data,ID){
    var age;
    for(var k = 0; k<data.length;k++){
        if(data[k]["Dummy.ID"] == ID){
            age = data[k]["Age.at.Diagnosis..Calculated."];
        }
    }
    return age;
}

function search_for_gender(data,ID){
    var gender;
    for(var k = 0; k<data.length;k++){
        if(data[k]["Dummy.ID"] == ID){
            gender = data[k]["Gender"];
        }
    }
    return gender;
}

function search_for_dosage(data,ID){
    var dosage;
    for(var k = 0; k<data.length;k++){
        if(data[k]["Dummy.ID"] == ID){
            dosage = data[k]["Total.dose"];
        }
    }
    return dosage;
    
}
function search_for_tumour_category(data,ID){
    var tumour_category;
    for(var k = 0; k<data.length;k++){
        if(data[k]["Dummy.ID"] == ID){
            tumour_category = data[k]["T.category"];
        }
    }
    return tumour_category;
    
}


function display_plot(div_id, plot_array){
var svg = d3.select(div_id)
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom+30)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

var xScale = d3.scale.linear()
    .domain([30,90])
    .range([30, width]);
    var yScale = d3.scale.linear()
    .domain([60,90])
    .range([height,0]);
    var sizeScale = d3.scale.ordinal()
    .domain(["T1","T2","T3","T4"])
    .range([3,13,23,33]);
    var colorScale = d3.scale.ordinal()
    .domain(["Male","Female"])
    .range(["rgba(33, 127, 242, 0.52)","rgba(242, 33, 166, 0.52)"]);

    svg.selectAll("circle")
    .data(plot_array)
    .enter()
    .append("circle")
    .attr("cx", function(d) {
        return xScale(d[1]);
    })
    .attr("cy", function(d) {
        return yScale(d[2]);
    })
    .attr("r",function(d){return sizeScale(d[4])})
    .style("fill",function(d){return colorScale(d[3]);});  
//------------------triangle plot--------------------------
    //     svg.selectAll(".point")
    //   .data(plot_array)
    // .enter().append("path")
    //   .attr("class", "point")
    //   .attr("d", d3.svg.symbol().type("triangle-up"))
    //   .attr("transform", function(d) { return "translate(" + xScale(d[1]) + "," + yScale(d[2]) + ")"; });
//----------------------------

    svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + (height) + ")")
    .call(d3.svg.axis()
    .scale(xScale)
    .orient("bottom"));

    svg.append("text")             
    .attr("transform","translate(" + (width/2) + " ," + (height + margin.top + 30) + ")")
    .style("text-anchor", "middle")
    .text("Age");

                       
    var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient("left")

    svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + (padding+10) + ",0)")
    .call(yAxis);

    svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left +35)
    .attr("x",0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Total Dosage");  


}
var i = 0,j = 0;
var ID_Baseline;
d3.csv("raw_result.csv", function(data_clusters){
d3.csv("mdasi_patients.csv",function(data_patients){
var to_plot = [];
for(i = 0; i<data_clusters.length; i++){

var to_push;
if(i == 0){
    ID_Baseline = data_clusters[i]["ID"];
    to_push = data_clusters[i];
    }
else{

    if(ID_Baseline != data_clusters[i]["ID"]){
        ID_Baseline = data_clusters[i]["ID"];
        to_push = data_clusters[i];

    }
    else{
        continue;
    }

}
    age = search_for_age(data_patients,ID_Baseline);
    dosage = search_for_dosage(data_patients,ID_Baseline);
    gender = search_for_gender(data_patients,ID_Baseline);
    tumour_category = search_for_tumour_category(data_patients,ID_Baseline);
    if(age != undefined && dosage != undefined){
        to_push["age"] = age;
        to_push["dosage"] = dosage;
        to_push["gender"] = gender;
        to_push["tumour_category"]=tumour_category;
        to_plot.push(to_push);
        
    }
        
}


var selected_symptom = "s1";
var rating_mild = [];
var rating_medium = [];
var rating_severe = [];

for(var k = 0; k<to_plot.length;k++){

if(to_plot[k][selected_symptom] <= 3){rating_mild.push([to_plot[k]["ID"], to_plot[k]["age"],to_plot[k]["dosage"],to_plot[k]["gender"], to_plot[k]["tumour_category"]])}
else if(to_plot[k][selected_symptom] >3 && to_plot[k][selected_symptom]<=6){rating_medium.push([to_plot[k]["ID"], to_plot[k]["age"],to_plot[k]["dosage"],to_plot[k]["gender"], to_plot[k]["tumour_category"]])}
else{rating_severe.push([to_plot[k]["ID"], to_plot[k]["age"],to_plot[k]["dosage"],to_plot[k]["gender"], to_plot[k]["tumour_category"]])}
}

// console.log(rating_mild);
// console.log(rating_medium);
// console.log(rating_severe);

var svg = d3.select("#legend_color");
svg.append("circle").attr("cx",200).attr("cy",30).attr("r", 6).style("fill", "rgba(33, 127, 242, 0.52)")
svg.append("circle").attr("cx",200).attr("cy",60).attr("r", 6).style("fill", "rgba(242, 33, 166, 0.52)")
svg.append("text").attr("x", 220).attr("y", 33).text("MALE").style("font-size", "15px").attr("alignment-baseline","middle")
svg.append("text").attr("x", 220).attr("y", 63).text("FEMALE").style("font-size", "15px").attr("alignment-baseline","middle")

display_plot("#rating_mild",rating_mild);
display_plot("#rating_medium",rating_medium);
display_plot("#rating_severe",rating_severe);

svg = d3.select("#legend_size");
svg.append("circle").attr("cx",200).attr("cy",50).attr("r",3 ).style("fill", "black")
svg.append("text").attr("x", 210).attr("y", 53).text("T1").style("font-size", "15px").attr("alignment-baseline","middle")
svg.append("circle").attr("cx",280).attr("cy",50).attr("r",13 ).style("fill", "black")
svg.append("text").attr("x", 295).attr("y", 53).text("T2").style("font-size", "15px").attr("alignment-baseline","middle")
svg.append("circle").attr("cx",370).attr("cy",50).attr("r",23 ).style("fill", "black")
svg.append("text").attr("x", 400).attr("y", 53).text("T3").style("font-size", "15px").attr("alignment-baseline","middle")
svg.append("circle").attr("cx",480).attr("cy",50).attr("r",33 ).style("fill", "black")
svg.append("text").attr("x", 520).attr("y", 53).text("T4").style("font-size", "15px").attr("alignment-baseline","middle")


})
});
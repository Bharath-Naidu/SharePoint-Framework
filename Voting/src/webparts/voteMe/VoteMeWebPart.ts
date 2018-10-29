import { Version, Environment, EnvironmentType } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-webpart-base';
import { escape } from '@microsoft/sp-lodash-subset';
//import CanvasJS from 'canvasjs';
import styles from './VoteMeWebPart.module.scss';
import * as strings from 'VoteMeWebPartStrings';
import{SPComponentLoader}from '@microsoft/sp-loader';
//import * as $ from 'jquery';
import 'jquery';
import { ISPHttpClientOptions, SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
require('bootstrap');
import * as pnp from 'sp-pnp-js';
var Buttonid;
var VoterId;
var CurrentLoginUser:string;
var UserStatus:boolean;
var TotalVotes=[0,0,0,0];
var Places=[];
import * as Chart from 'chart.js';
import {GoogleCharts} from 'google-charts';
export interface IVoteMeWebPartProps {
  description: string;
}

export default class VoteMeWebPart extends BaseClientSideWebPart<IVoteMeWebPartProps> 
{
  public render(): void 
  {
    let url="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css";
    SPComponentLoader.loadCss(url);
    this.domElement.innerHTML = `
    <div class="btn-toolbar" role="toolbar" aria-label="Toolbar with button groups" id="contents">
    </div>
     </br></br></br>
        <div class="modal-footer">
        <i class="fa fa-thumbs-up"></i>
          <button type="button" id="submit">Submit</button>
        </div>
    </div>
    <div id="AlreadyUseVote"></div>
    <br><br><br><br><br>
    <div>
    <div id="piechart"></div>
    <canvas id="doughnut-chart" width="800" height="450"></canvas>
    </div>
    `;
    
  var absurl = this.context.pageContext.web.absoluteUrl;
  CurrentLoginUser=this.context.pageContext.user.email;
    $(document).ready(function(){
      var ClickButtonid;
      //alert(UserStatus);
        /***************DSC**************** */
        var call = jQuery.ajax(
          {
              url: absurl + `/_api/web/Lists/GetByTitle('ParticipantsBharath')/items?$select=Title,ID`,
              type: "GET",
              dataType: "json",
              headers: 
              {
                  Accept: "application/json;odata=verbose"
              }
          });
          call.done(function (data, textStatus, jqXHR) {
              var AssignButton=$('#contents');
              var count=0;
              $.each(data.d.results,function(val,value)
              {
                Places[count]=value.Title;
                count++;
                //alert(Places[(value.ID)-1]);
                AssignButton.append(`<div class="btn-group mr-2" role="group" aria-label="First group">
                 <button type="button" class="btn btn-success" id="${value.ID}">${value.Title}</button></div>`);
              });
          });
          call.fail(function (jqXHR, textStatus, errorThrown) {
              var response = JSON.parse(jqXHR.responseText);
              var message = response ? response.error.message.value : textStatus;
              alert("Call failed. Error: " + message);
          });
        /********************DSC************* */
      // $(".btn").click(function()
      // {
      //   alert("fdsfsd");
      //   Buttonid=this.id;
      //   alert(Buttonid);
      // });
      // GoogleCharts.load(drawChart);

      // function drawChart() 
      // {
      //   var items=[['India',45],['china',74],['US',96],['UK',78]];
      //   const data = GoogleCharts.api.visualization.arrayToDataTable(items);
      //   const pie_1_chart = new GoogleCharts.api.visualization.PieChart(document.getElementById('piechart'));
      //   pie_1_chart.draw(data);
      // }
      // $('.btn).click(function()
      // {

     // });
      $(document).on('click','.btn-success',function()
      {
        // $('.btn').click(function()
        // {
        //   Buttonid=this.id;
        // });
        //alert("button");
        Buttonid=$(this).attr("id"); 
        //alert(Buttonid);
        //alert("clicked" +Buttonid);
        $(".btn").removeClass('active').addClass('disabled');
        $('#'+Buttonid).removeAttr('class');
        $('#'+Buttonid).addClass('active btn btn-success');
      });
    });
    
    


    this.UserIsUseTheVoterList();
    this.calltovote();
    this.GetVoterList();
    this.piechart();

  }
  private piechart()
  {
    //alert(Places[0]);
    new Chart(document.getElementById("doughnut-chart"), {
      type: 'doughnut',
      data: {
        labels:Places,
        datasets: [
          {
            label: "Votes submitted",
            backgroundColor: ["#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9","#c45850"],
            data: TotalVotes
          }
        ]
      },
      options: {
        title: {
          display: true,
          text: 'Predicted world population (millions) in 2050'
        }
      }
  });
  
  }
  private GetVoterList()
  {
    var call = jQuery.ajax(
      {
          url: this.context.pageContext.web.absoluteUrl + `/_api/web/Lists/GetByTitle('AllVoters')/items?$select=Title,Vote`,
          type: "GET",
          dataType: "json",
          headers: 
          {
              Accept: "application/json;odata=verbose"
          }
      });
      //alert("After call in UserIsUseTheVoterList method");
      call.done(function (data, textStatus, jqXHR)
       {
         //alert("User is Use the vote");
         
         var EnterCondiation:boolean=true;
          // var button=$('#contents');
          $.each(data.d.results,function(val,value)
          {
            TotalVotes[(value.Vote)-1]++; 
            //alert(TotalVotes[(value.Vote)-1]);
          });
          
      });
      call.fail(function (jqXHR, textStatus, errorThrown) {
        //alert("User not use the vote");
          var response = JSON.parse(jqXHR.responseText);
          var message = response ? response.error.message.value : textStatus;

      });
  }
    
    
//---------------------------------------------------------------------------------------------------

  private calltovote()
  {
      document.getElementById("submit").addEventListener('click',()=>this.SaveVote());  
  }
  private UpdatedVote()
  {
    //alert("clicked on "+Buttonid);
      // pnp.sp.web.lists.getByTitle("AllVoters").items.getById(VoterId).update({
      //  Vote : Buttonid
      // });
  }
  protected get dataVersion(): Version 
  {
    return Version.parse('1.0');
  }
  //-----------------------Find the user is use the vote or not------------------------
  private UserIsUseTheVoterList()
  {
    //alert("finding user is use the vote or not");
    
    var call = jQuery.ajax(
            {
                url: this.context.pageContext.web.absoluteUrl + `/_api/web/Lists/GetByTitle('AllVoters')/items?$select=Title,Vote,ID&$filter=Title eq '${CurrentLoginUser}'`,
                type: "GET",
                dataType: "json",
                headers: 
                {
                    Accept: "application/json;odata=verbose"
                }
            });
            //alert("After call in UserIsUseTheVoterList method");
            call.done(function (data, textStatus, jqXHR)
             {
               //alert("User is Use the vote");
               
               var EnterCondiation:boolean=true;
                // var button=$('#contents');
                $.each(data.d.results,function(val,value)
                {
                  var returnvalue=value.Title;
                // alert("Title is "+returnvalue);
                  if(returnvalue===CurrentLoginUser)
                  {
                    UserStatus=false;
                    EnterCondiation=false;
                  }
                  //alert("false");
                  //alert("Your are already voted")
                 // $('#submit').attr("disabled", "disabled");
                  var useVote=jQuery('#AlreadyUseVote');
                  VoterId=value.ID;
                  useVote.append("<h3> You have already voted..........</h3>");
                  $(".btn-success").removeClass('active').addClass('disabled');
                  $('#'+value.Vote).removeAttr('class');
                  $('#'+value.Vote).addClass('active btn btn-success');
                  
                });
                if(EnterCondiation)
                {
                  UserStatus=true;
                  //alert("true "+UserStatus);
                }
            });
            call.fail(function (jqXHR, textStatus, errorThrown) {
              //alert("User not use the vote");
                var response = JSON.parse(jqXHR.responseText);
                var message = response ? response.error.message.value : textStatus;

            });
  }
  //---------------------------------------adding vote to list--------------------------------
  public SaveVote() 
  {
   // alert("SaveVote is called");
    if(UserStatus)
    {
            //alert("coming is added a vote "+UserStatus);
          if (Environment.type === EnvironmentType.Local) {
            this.domElement.querySelector('#listdata').innerHTML = "Sorry this does not work in local workbench";
          } 
          else{
            
          var Userid=CurrentLoginUser;
          //alert("Location is : "+Buttonid);
          const spOpts: ISPHttpClientOptions = {
            body: `{ Vote: '${Buttonid}', Title:  '${Userid}'}`
          };
          var Url= this.context.pageContext.web.absoluteUrl+ "/_api/web/lists/getByTitle('AllVoters')/Items";
          this.context.spHttpClient.post(
            Url, SPHttpClient.configurations.v1,spOpts)
            .then((response: SPHttpClientResponse) => {
              console.log("After creation response", response);
              response.json().then((responseJSON: JSON) => {
                console.log("JSON", responseJSON);
              });
              if (response.ok) {
                //alert("added");
              } else
              //alert("fail");
              return;
            })
            .catch((error: SPHttpClientResponse) => {
              console.log(error);
              return;
            });
            var useVote=jQuery('#AlreadyUseVote');
            useVote.append("<h3> Your Vote is added </h3>");
            $('#submit').attr("disabled", "disabled");

          }
    
  }else if(UserStatus == false)
  {
     pnp.sp.web.lists.getByTitle("AllVoters").items.getById(VoterId).update({
        Vote : Buttonid
       });
    alert("Now Updated "+Buttonid);
  }
  
  }
  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}

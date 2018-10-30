import { Version, Environment, EnvironmentType } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-webpart-base';
import { escape } from '@microsoft/sp-lodash-subset';
// import 'jquery';
import * as Chart from 'chart.js'
import * as $ from 'jquery';
import * as pnp from 'sp-pnp-js';
import styles from './UnderstandTheFlowWebPart.module.scss';
import * as strings from 'UnderstandTheFlowWebPartStrings';
import{SPComponentLoader}from '@microsoft/sp-loader';
import { ISPHttpClientOptions, SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
export interface IUnderstandTheFlowWebPartProps {
  description: string;
}
var Buttonid;
var VoterId;
var CurrentLoginUser:string;
var UserStatus:boolean;
var TotalVotes=[0,0,0,0];
var Places=[];
var absurl;
export default class UnderstandTheFlowWebPart extends BaseClientSideWebPart<IUnderstandTheFlowWebPartProps> {

  public render(): void 
  {
    CurrentLoginUser=this.context.pageContext.user.email;
    absurl= this.context.pageContext.web.absoluteUrl;
    let url="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css";
    SPComponentLoader.loadCss(url);

    this.domElement.innerHTML = `
    <div class="btn-toolbar" role="toolbar" aria-label="Toolbar with button groups" id="contents">
    </div>
     </br></br></br>
        <div class="modal-footer">
        <i class="fa fa-thumbs-up"></i>
        <button class="btn btn-primary" data-toggle="confirmation" data-confirmation-event="myevent">Submit</button>
        </div>
    </div>
    <div id="AlreadyUseVote"></div>
    <br><br><br><br><br>
    <div>
    <canvas id="doughnut-chart" width="800" height="450"></canvas>
    </div>
      `;
      $(document).ready(function(){
        //alert("Document ready call");
      });
      this.GetListdata();
      this.UserIsUseTheVoterList();
      $(".btn").click(function()
      {
        Buttonid=this.id;
        $(".btn").removeClass('active').addClass('disabled');
        $('#'+Buttonid).removeAttr('class');
        $('#'+Buttonid).addClass('active btn btn-success');
      });
      this.GetVoterList();
      document.getElementById("submit").addEventListener('click',()=>this.SaveVote());  
      
  }
  private GetListdata()
  {
    //alert("GetListdata method calls");
    var call = jQuery.ajax(
      {
          url: absurl + `/_api/web/Lists/GetByTitle('ParticipantsBharath')/items?$select=Title,ID`,
          type: "GET",
          dataType: "json",
          async: false,
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
            //alert("ready done called");
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
  }
  private UserIsUseTheVoterList()
  {
   // alert("user is use the voter or not");
    var call = jQuery.ajax(
            {
                url: this.context.pageContext.web.absoluteUrl + `/_api/web/Lists/GetByTitle('AllVoters')/items?$select=Title,Vote,ID&$filter=Title eq '${CurrentLoginUser}'`,
                type: "GET",
                dataType: "json",
                async: false,
                headers: 
                {
                    Accept: "application/json;odata=verbose"
                }
            });
            call.done(function (data, textStatus, jqXHR)
             {
               var EnterCondiation:boolean=true;
                $.each(data.d.results,function(val,value)
                {
                  var returnvalue=value.Title;
                  if(returnvalue===CurrentLoginUser)
                  {
                    UserStatus=false;
                    EnterCondiation=false;
                  }
                  var useVote=jQuery('#AlreadyUseVote');
                  VoterId=value.ID;
                  useVote.append("<h3> You have already voted..........</h3>");
                  $(".btn-success").removeClass('active').addClass('disabled');
                 // alert("Selected Location perv :"+value.Vote);
                  $('#'+value.Vote).removeAttr('class');
                  $('#'+value.Vote).addClass('active');
                  $('#'+value.Vote).addClass('btn');
                  $('#'+value.Vote).addClass('btn-success');
                });
                if(EnterCondiation)
                {
                  UserStatus=true;
                }
            });
            call.fail(function (jqXHR, textStatus, errorThrown) {
                var response = JSON.parse(jqXHR.responseText);
                var message = response ? response.error.message.value : textStatus;
            });
            
  }
  private SaveVote()
  {
     //alert("SaveVote is called");
    if(UserStatus)
    {
            
      var Userid=CurrentLoginUser;
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
      }).then(()=>{  
      this.GetVoterList();
      })
      .catch((error: SPHttpClientResponse) => {
      console.log(error);
      return;
      });
      var useVote=jQuery('#AlreadyUseVote');
      useVote.append("<h3> Your Vote is added </h3>");
      $('#submit').attr("disabled", "disabled");
    }else if(UserStatus == false)
    {
      pnp.sp.web.lists.getByTitle("AllVoters").items.getById(VoterId).update({
          Vote : Buttonid
       })
       .then(() => {

        jQuery('#AlreadyUseVote').empty();
        var useVote=jQuery('#AlreadyUseVote');
             useVote.append("<h3> Your Vote is Updated </h3>");
             this.GetVoterList();
       });
    //alert("Now Updated "+Buttonid);
    }
    
  }
  private GetVoterList()
  {
    TotalVotes.length=0;
    for(var i=0;i<Places.length;i++)
        TotalVotes[i]=0;
    var call = jQuery.ajax(
      {
          url: this.context.pageContext.web.absoluteUrl + `/_api/web/Lists/GetByTitle('AllVoters')/items?$select=Title,Vote`,
          type: "GET",
          dataType: "json",
          async: false,
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
           // alert(value.Title+"   "+value.Vote)
            TotalVotes[(value.Vote)-1]++; 
            //alert(TotalVotes[(value.Vote)-1]);
          });
          
      });
      call.fail(function (jqXHR, textStatus, errorThrown) {
        //alert("User not use the vote");
          var response = JSON.parse(jqXHR.responseText);
          var message = response ? response.error.message.value : textStatus;

      });
      //alert("Places "+Places)
      //alert("Present the voters "+TotalVotes);
      this.piechart();
  }
  private piechart()
  {
   // alert("Pie chart");
    //alert(Places);
    //alert(TotalVotes);
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






  protected get dataVersion(): Version {
    return Version.parse('1.0');
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

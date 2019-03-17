import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { MemberInfo, MemberServiceService } from '../member-service.service';

@Component({
  selector: 'app-sorting-hat',
  templateUrl: './sorting-hat.component.html',
  styleUrls: ['./sorting-hat.component.css']
})
export class SortingHatComponent implements OnInit  {

  imgSrc = '/assets/sortingHat.png';
  sorting_result = '';
  targetMember: MemberInfo ;
  team_members: { [team_no: string]: Array<MemberInfo> }  ;  // 各組人數
  team_count: [];
  has_sorted = false ;  // 判斷是否已經排過了？如果排過，就不要再排。

  constructor(
    public dialogRef: MatDialogRef<SortingHatComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private memberService: MemberServiceService) {
  }

  ngOnInit() {
    this.targetMember = this.data.member ;
    this.team_members = this.data.team_members ;
    this.team_count = this.data.team_count ;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  async beginSorting() {
    // 避免重複排序
    if (this.has_sorted) {
      return ;
    }

    // 0. 切換成動畫畫面
    this.imgSrc = '/assets/sh3.gif';

    // 0.1 逐漸出現字 .....
    const tempWords = '嗯，你應該是 .....' ;
    for (let i = 0; i < tempWords.length; i++) {
      this.sorting_result = tempWords.substr(0, i + 1);
      await this.delay(300);
    }
    await this.delay(1000);

    // 1. 找出要分類的使用者，以及其身份 -- 不用找了，已經是 this.targetMember 了

    // 2. 比較各組中該身份的人數，找出最少的組別(可能多個，但取最後一個)
    let targetTeamNo = 1;
    let firstTeam = this.team_members[targetTeamNo];
    let candidateTeams = [targetTeamNo];  // 待分配的所有組別，預設第一組
    this.team_count.forEach( (teamNo) => {
      const secondTeam = this.team_members[teamNo];
      // 2.1 找出各組中，該身份的人數最少的幾個組別
      const team2_OrgCount = this.findMemberCount(secondTeam, this.targetMember.org) ;
      const team1_OrgCount = this.findMemberCount(firstTeam, this.targetMember.org) ;
      if ( team2_OrgCount < team1_OrgCount) {
        targetTeamNo = teamNo ;
        firstTeam = secondTeam ;
        candidateTeams = [teamNo];  // 重設為該組
      } else if ( team2_OrgCount === team1_OrgCount) {
        candidateTeams.push(teamNo);
      }
    });
    console.log(candidateTeams);
    // 2.2 從最少的組別中，隨機挑選一組。
    const targetTeamNoIndex = Math.floor( Math.random() * candidateTeams.length ) + 1 ;
    targetTeamNo = candidateTeams[targetTeamNoIndex - 1];
    console.log('target team no :', targetTeamNo);


    // 3.0 更新到 Firebase
    this.targetMember.team = targetTeamNo.toString();
    this.memberService.updateMember(this.targetMember);
    // 3.1 標記這個人已經排完了，避免重複再排。
    this.has_sorted = true ;
    // 3.1 更新拉砲圖片
    // this.imgSrc = '/assets/celebration1.gif';
    this.playGif();
    // 3.2 在畫面顯示分類結果
    this.sorting_result = `你應該是：第${targetTeamNo}組`;
    // 3.3 播放歡呼聲
    this.playAudio();
  }

  // 找出這些人中，指定角色的人數
  findMemberCount(members: MemberInfo[], org) {
    let result = 0;
    if (members) {
      members.forEach( (m) => {
        if (m.org === org) {
          result += 1;
        }
      });
    }
    return result ;
  }

  delay(ms: number) {
      return new Promise( resolve => setTimeout(resolve, ms) );
  }

  closeDialog() {
    this.onNoClick();
  }

  // 播放慶祝動畫
  playGif() {
    const all_gifs = ['celebration4.gif', 'celebration2.gif', 'celebration1.gif', 'celebration3.gif'];
    const gif_index = Math.floor(Math.random() * all_gifs.length);
    const targetGif = all_gifs[gif_index] ;
    console.log(targetGif);
    this.imgSrc = `/assets/${targetGif}`;
  }

  // 播放歡呼聲
  playAudio() {
    const all_audio = ['happykids.mp3', 'Cheering.mp3', 'cheer.mp3'];
    const audio_index = Math.floor(Math.random() * all_audio.length);
    const targetAudio = all_audio[audio_index] ;
    console.log(targetAudio);

    const audio = new Audio();
    audio.src = `/assets/${targetAudio}`;
    // if (this.targetMember.org === '領袖') {  audio.src = '/assets/happykids.mp3'; }
    // if (this.targetMember.org === '單程') {  audio.src = '/assets/Cheering.mp3'; }
    audio.load();
    audio.play();
  }
}



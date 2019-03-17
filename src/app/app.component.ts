import { Component, OnInit } from '@angular/core';
import { MemberServiceService, MemberInfo } from './member-service.service';
import { MatDialog } from '@angular/material';
import { SortingHatComponent } from './sorting-hat/sorting-hat.component';
import { RemoveConfirmComponent } from './remove-confirm/remove-confirm.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'sorting-hat';
  all_members: Array<MemberInfo> ;
  members: Array<MemberInfo> ;
  search_keyword = '';
  leader_count = 0; // 領袖人數
  single_count = 0; // 單成人數
  ym_count = 0; // 男女青年數量
  team_count = [1, 2, 3, 4, 5, 6, 7, 8];  // 隊伍數量
  leaders = [];
  single_adults = [];
  young_men = [];
  not_dispatch = [];
  team_members: { [team_no: string]: Array<MemberInfo> } = {}  ;  // 各組人數

  constructor(
    private memberService: MemberServiceService,
    public dialog: MatDialog) {
  }

  async ngOnInit() {
    // this.importDataToFirestore();
    this.memberService.getMembers().subscribe(data => {
      console.log('data', data);

      this.all_members = data.map(e => {
        const m: MemberInfo = e.payload.doc.data() as MemberInfo ;
        m.id = e.payload.doc.id ;
        return m;
      });

      console.log('this.all_members' , this.all_members);

      this.all_members = this.all_members.sort((n1, n2) => {
        let result = 0;
        if (n1.name > n2.name) { result = 1; }
        if (n1.name < n2.name) { result = -1; }
        return result ;
      });
      console.log(this.all_members);
      this.filterMembers(this.all_members);

    });
  }

  async importDataToFirestore() {
        // 匯入資料
    this.all_members = await this.memberService.getMembersFromJson();

    for (let i = 0; i < this.all_members.length; i++ ) {
      const m = this.all_members[i];
      this.memberService.createMember(m);
    }

    console.log('');
  }

  openDialog(m: MemberInfo): void {
    const dialogRef = this.dialog.open(SortingHatComponent, {
      width: '500px',
      data: { member: m, team_members: this.team_members, team_count: this.team_count }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
    });
  }

  openRemoveConfirmDialog(m: MemberInfo): void {
    const dialogRef = this.dialog.open(RemoveConfirmComponent, {
      width: '500px',
      data: m
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
    });
  }



  /**
   * 篩選出尚未分組的人
   */
  filterMembers(members: Array<MemberInfo>) {
    this.leaders = [];
    this.single_adults = [];
    this.young_men = [];
    this.not_dispatch = [];
    this.team_members = {};

    members.forEach((m, index) => {
      if (!m.team) {
        this.not_dispatch.push(m);
      } else {
        const team_no = m.team ;
        if (!this.team_members[team_no]) {
          this.team_members[team_no] = [];
        }
        this.team_members[team_no].push(m);
      }
    });

    this.not_dispatch.forEach( (m) => {
      if (m.org === '領袖') {
        this.leaders.push(m);
      }
      if (m.org === '單成') {
        this.single_adults.push(m);
      }
      if (m.org === '男女青') {
        this.young_men.push(m);
      }
    });

    this.members = this.not_dispatch ;
  }
  search(v: any): void {
    console.log(v);
    const tempMembers = this.all_members.filter( (m) => {
      return (m.name.indexOf(v) > -1);
    });
    this.filterMembers(tempMembers);
  }

  clickMember(m: MemberInfo) {
    console.log(m);
    this.openDialog(m);
  }

  removeMemberFromTeam(m: MemberInfo) {

    console.log('remove member', m);
    this.openRemoveConfirmDialog(m);
    // this.filterMembers();
  }

  getBgColor(org) {
    let result: String = 'primary';
    if (org === '男女青') {
      result = 'accent';
      // result = ''
    }
    if (org === '領袖') {
      result = 'green';
    }
    if (org === '單成') {
      result = 'primary';
    }
    return result ;
  }

}

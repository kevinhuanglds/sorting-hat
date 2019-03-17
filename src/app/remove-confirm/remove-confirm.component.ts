import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { MemberInfo, MemberServiceService } from '../member-service.service';

@Component({
  selector: 'app-remove-confirm',
  templateUrl: './remove-confirm.component.html',
  styleUrls: ['./remove-confirm.component.css']
})
export class RemoveConfirmComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<RemoveConfirmComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MemberInfo,
    private memberService: MemberServiceService) {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
  }

  closeDialog() {
    this.dialogRef.close();
  }

  removeFromTeam() {
    this.data.team = '';
    this.memberService.updateMember(this.data);
    this.closeDialog();
  }

}

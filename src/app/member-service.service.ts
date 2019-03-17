import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class MemberServiceService {

  constructor(private http: HttpClient,
    private firestore: AngularFirestore) { }

  async getMembersFromJson() {
      return this.http.get<Array<MemberInfo>>('/assets/members.json').toPromise();
  }
  getMembers() {
    // return this.http.get<Array<MemberInfo>>('/assets/members.json').toPromise();
    return this.firestore.collection('members').snapshotChanges();
  }

  createMember(m: MemberInfo) {
    // return this.http.get<Array<MemberInfo>>('/assets/members.json').toPromise();
    return this.firestore.collection('members').add(m);
  }
  updateMember(m: MemberInfo) {
    // return this.http.get<Array<MemberInfo>>('/assets/members.json').toPromise();
    this.firestore.doc('members/' + m.id).update(m);
    // return this.firestore.collection('members').snapshotChanges().();
  }
  deleteMember(mID: string) {
    this.firestore.doc('members/' + mID).delete();
  }
}


export class MemberInfo {
  id = '' ;
  name = '' ;
  unit = '' ;
  org = '';
  team = '';
  constructor(_id, _name, _unit, _org) {
    this.id = _id ;
    this.name = _name ;
    this.unit = _unit ;
    this.org = _org ;
  }
}

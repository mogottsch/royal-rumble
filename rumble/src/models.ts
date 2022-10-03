/* Do not change, this code is generated from Golang structs */

export class Wrestler {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: DeletedAt;
  LobbyID: number;
  Lobby: Lobby;
  Status: number;
  EntranceNumber: number;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], DeletedAt);
    this.LobbyID = source["LobbyID"];
    this.Lobby = this.convertValues(source["Lobby"], Lobby);
    this.Status = source["Status"];
    this.EntranceNumber = source["EntranceNumber"];
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (a.slice) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class Lobby {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: DeletedAt;
  user_in_lobbies?: UserInLobby[];
  code: string;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], DeletedAt);
    this.user_in_lobbies = this.convertValues(
      source["user_in_lobbies"],
      UserInLobby
    );
    this.code = source["code"];
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (a.slice) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class User {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: DeletedAt;
  name: string;
  user_in_lobbies?: UserInLobby[];

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], DeletedAt);
    this.name = source["name"];
    this.user_in_lobbies = this.convertValues(
      source["user_in_lobbies"],
      UserInLobby
    );
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (a.slice) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class UserInLobby {
  ID: number;
  CreatedAt: Time;
  UpdatedAt: Time;
  DeletedAt: DeletedAt;
  user_id: number;
  user?: User;
  lobby_id: number;
  lobby?: Lobby;
  wrestler_id: number;
  wrestler?: Wrestler;
  next_entrance_number: number;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.ID = source["ID"];
    this.CreatedAt = this.convertValues(source["CreatedAt"], Time);
    this.UpdatedAt = this.convertValues(source["UpdatedAt"], Time);
    this.DeletedAt = this.convertValues(source["DeletedAt"], DeletedAt);
    this.user_id = source["user_id"];
    this.user = this.convertValues(source["user"], User);
    this.lobby_id = source["lobby_id"];
    this.lobby = this.convertValues(source["lobby"], Lobby);
    this.wrestler_id = source["wrestler_id"];
    this.wrestler = this.convertValues(source["wrestler"], Wrestler);
    this.next_entrance_number = source["next_entrance_number"];
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (a.slice) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class DeletedAt {
  Time: Time;
  Valid: boolean;

  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
    this.Time = this.convertValues(source["Time"], Time);
    this.Valid = source["Valid"];
  }

  convertValues(a: any, classs: any, asMap: boolean = false): any {
    if (!a) {
      return a;
    }
    if (a.slice) {
      return (a as any[]).map((elem) => this.convertValues(elem, classs));
    } else if ("object" === typeof a) {
      if (asMap) {
        for (const key of Object.keys(a)) {
          a[key] = new classs(a[key]);
        }
        return a;
      }
      return new classs(a);
    }
    return a;
  }
}
export class Time {
  constructor(source: any = {}) {
    if ("string" === typeof source) source = JSON.parse(source);
  }
}

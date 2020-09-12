create user equalplus@localhost;
create schema equalplus;

grant all privileges on equalplus.* to equalplus@localhost;
use equalplus;

create table guilds
(
	gid varchar(20) not null
);

create unique index guilds_gid_uindex
	on guilds (gid);

alter table guilds
	add constraint guilds_pk
		primary key (gid);

alter table guilds
	add agreeAt timestamp default current_timestamp not null;

alter table guilds
	add mods text not null;

alter table guilds
	add name text not null;

alter table guilds
	add icon text;

create table msglog
(
	mid varchar(20) not null,
	gid varchar(20) not null,
	cid varchar(20) not null,
	uid varchar(20) not null,
	length int not null,
	isMod boolean default false not null,
	hasFile boolean default false not null,
	hasMention boolean default false not null,
	mentionTo varchar(20),
	createdAt TIMESTAMP default CURRENT_TIMESTAMP not null,
	fileSize text
);

create unique index msglog_mid_uindex
	on msglog (mid);

alter table msglog
	add constraint msglog_pk
		primary key (mid);

alter table guilds
	add voiceCount int default 0 not null;

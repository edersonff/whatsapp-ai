import { Injectable, Logger } from '@nestjs/common';
import axios, { Axios } from 'axios';
import { Lang } from 'types/language/enum';
import { Category } from 'src/category/entities/category.entity';
import { UsersService } from 'src/users/users.service';
import { Video } from 'src/video/entities/video.entity';
import { VideoService } from 'src/video/video.service';
import {
  uniqueNamesGenerator,
  names,
  adjectives,
  countries,
  starWars,
} from 'unique-names-generator';
import {
  upload as uploadToYoutube,
  comment as commentYoutube,
} from 'youtube-videos-uploader';
import { Create } from 'tmpmail';
import { createWriteStream, existsSync } from 'fs';
import { join } from 'path';
import { mkdir, unlink } from 'fs/promises';
import { ProductService } from 'src/product/product.service';
import { Product } from 'src/product/entities/product.entity';
import { Cron } from '@nestjs/schedule';
import { DateTime } from 'luxon';
import { LessThan } from 'typeorm';
import { PostService } from 'src/post/post.service';
import { CategoryService } from 'src/category/category.service';

const apiSignout = new Axios({
  baseURL: 'https://app.trydub.com',
  headers: {
    'Content-Type': 'multipart/form-data',
    Accept: 'text/x-component',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'Accept-Language': 'en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7',
    'Cache-Control': 'no-cache',
    'Next-Router-State-Tree':
      '%5B%22%22%2C%7B%22children%22%3A%5B%22(app)%22%2C%7B%22children%22%3A%5B%22register%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%5D%7D%5D%7D%5D%7D%2Cnull%2Cnull%2Ctrue%5D',
    Origin: 'https://app.trydub.com',
    Pragma: 'no-cache',
    Referer: 'https://app.trydub.com/register',
    'Sec-Ch-Ua':
      '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  },
});

const apiSignin = new Axios({
  baseURL: 'https://app.trydub.com',
  headers: {
    accept: 'application/json, text/plain, */*',
    'accept-language': 'en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7',
    'cache-control': 'no-cache',
    'content-type': 'application/json',
    pragma: 'no-cache',
    'sec-ch-ua':
      '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    Referer: 'https://app.trydub.com/dubbing',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  },
});

function getPassword() {
  const length = 8;
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0, n = charset.length; i < length; ++i) {
    password += charset.charAt(Math.floor(Math.random() * n));
  }
  return password;
}

async function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

class Trydub {
  name: string = '';

  email: string = '';
  password: string = '';
  cookie: string = '';

  tempMail: Create;

  constructor() {
    this.getUniqueName();
    this.getPassword();
  }

  getUniqueName = () => {
    this.name =
      uniqueNamesGenerator({
        dictionaries: [adjectives, names, countries, starWars],
        length: 3,
        separator: '-',
      }) +
      '-' +
      Math.random().toString(36).substring(7);
  };

  getPassword = () => {
    this.password = getPassword();
  };

  getTempMail = async () => {
    const client = await Create();

    const email: string = await new Promise((resolve) => {
      client.on('ready', (email) => {
        resolve(email);
      });
    });

    this.email = email;

    this.tempMail = client;
  };

  register = async () => {
    const formData = new FormData();

    formData.append('1_email', this.email);
    formData.append('1_password', this.password);
    formData.append('0', '["$K1"]');

    const registerPost = apiSignout.post('/register', formData, {
      headers: {
        'Next-Action': 'f848affe288a368678657e5ceee8cca4eaa9d869',
      },
    });

    await registerPost;

    await wait(1000);

    await registerPost;
  };

  login = async () => {
    const formData = new FormData();

    formData.append('1_email', this.email);
    formData.append('1_password', this.password);
    formData.append('0', '["$K1"]');

    const data = await apiSignout.post('/login', formData, {
      headers: {
        'Next-Action': 'c49e38ffaefa112e8b778a9d395d15345e7dc95b',
      },
    });

    const setCookie = data.headers['set-cookie'][0];

    if (!setCookie || typeof setCookie !== 'string') {
      throw new Error('Cookie not found');
    }

    this.cookie = setCookie;
  };

  waitForEmail = async () => {
    let emails = await this.tempMail.fetch();

    while (emails.length === 0) {
      await wait(1000);
      emails = await this.tempMail.fetch();
    }

    const email = await this.tempMail.findMessage(emails[0]._id);

    return email;
  };

  confirmEmail = async (html: string) => {
    const confirmUrl =
      'https://app.trydub.com/auth/confirm?' +
      html.split('https://app.trydub.com/auth/confirm?')[1].split(']')[0];

    await apiSignout.get(decodeURIComponent(confirmUrl));
  };

  postProject = async (data: {
    name?: string;
    sourceObject?: any;
    sourceUrl?: string;
    sourceLanguage?: Lang;
    targetLanguage?: Lang;
    mediaDuration?: number;
    includeBackground?: boolean;
    speakerNumber?: string;
  }) => {
    await apiSignin.post('/api/projects', JSON.stringify(data), {
      headers: {
        Cookie: this.cookie,
      },
    });
  };

  getProject = async () => {
    const { data } = await apiSignin.get('/projects', {
      headers: {
        Cookie: this.cookie,
      },
    });

    const strData = data.replace(/\\\"/g, '"');

    const hasData = strData.includes(`{"data":`);

    if (!hasData) {
      return [];
    }

    const decodedData = strData.split(`{"data":`)[1].split('}]')[0];

    const arr = JSON.parse(`${decodedData}}]`);

    return arr;
  };

  createUrlProject = async (projectId: string) => {
    const { data } = await apiSignin.post(
      '/api/createUrl',
      JSON.stringify({
        key: projectId,
        method: 'get',
      }),
      {
        headers: {
          Cookie: this.cookie,
        },
      },
    );

    return JSON.parse(data).url;
  };
}

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  public userId: number;

  constructor(
    private readonly videoService: VideoService,
    private readonly userService: UsersService,
    private readonly productService: ProductService,
    private readonly postService: PostService,
    private readonly categoryService: CategoryService,
  ) {}

  @Cron('*/15 * * * *')
  async renderVideosCron() {
    const videos = await this.videoService.findAll({
      take: 5,
      where: {
        status: 'draft',
      },
    });

    if (videos.length === 0) {
      this.logger.debug('No videos to process', new Date());
      return;
    }

    try {
      const trydub = new Trydub();

      await trydub.getTempMail();

      await trydub.register();

      const email = await trydub.waitForEmail();

      const html = email.body.text;

      await trydub.confirmEmail(html);

      this.logger.debug(
        'Account created',
        trydub.email,
        trydub.password,
        new Date(),
      );

      await wait(1000);

      await trydub.login();

      for (const video of videos) {
        const { link, name, originalLanguage, targetLanguage } = video;

        await trydub.postProject({
          name: (name || 'Untitled') + ' ' + new Date().toISOString(),
          sourceUrl: link,
          sourceLanguage: originalLanguage,
          targetLanguage: targetLanguage,
          mediaDuration: 0,
          includeBackground: true,
          speakerNumber: '0',
        });

        this.logger.debug('Project posted', new Date());
      }

      let projects = (await trydub.getProject()).filter(
        (project) => project.status === 'completed',
      );

      while (projects.length < videos.length) {
        await wait(20000);
        projects = (await trydub.getProject()).filter(
          (project) => project.status === 'completed',
        );
      }

      for (const project of projects) {
        const url = await trydub.createUrlProject(project.finalObject);

        const video = videos.find((video) => video.link === project.sourceUrl);

        await this.videoService.update(video.id, {
          output: url,
          status: 'ready',
        });

        this.logger.debug('Video rendered', new Date());
      }

      this.logger.debug('All videos rendered', new Date());
    } catch (e) {
      console.error(e);
      this.logger.error(e, new Date());
    }
  }

  @Cron('*/30 * * * *')
  async commentVideosCron() {
    const twoHoursAgo = DateTime.now().minus({ minutes: 30 }).toJSDate();

    const posts = await this.postService.findAll({
      where: {
        createdAt: LessThan(twoHoursAgo),
        status: 'draft',
      },
      relations: {
        user: {
          socials: true,
        },
        video: true,
      },
    });

    const categories = await this.categoryService.findAll({
      relations: {
        products: true,
      },
    });

    if (posts.length === 0) {
      this.logger.debug('No posts to comment', new Date());
      return;
    }

    for (const post of posts) {
      const { type, link, video, code, user } = post;

      const category = categories.find(
        (category) => category.id === video.category.id,
      );

      const product = category.products.find(
        (product) => product.category.id === category.id,
      );

      const social = user.socials.find((social) => social.type === type);

      if (!product || !category) {
        continue;
      }

      const comment = this.getProductMessage(product);
      try {
        switch (type) {
          case 'youtube':
            await this.commentToYoutube({ link, comment, social });
            break;
          case 'meta':
            await this.commentToFacebook({ code, comment, social });
            break;
          case 'instagram':
            await this.commentToInstagram({ code, comment, social });
            break;
          case 'tiktok':
            // await this.uploadToTiktok(video, user.socials[0].token);
            break;
          case 'pinterest':
            // await this.uploadToPinterest(video, user.socials[0].token);
            break;
        }
      } catch (e) {
        await this.postService.update(post.id, {
          status: 'error',
        });
      }

      await this.postService.update(post.id, {
        status: 'commented',
      });

      this.logger.debug('Comment posted', new Date());
    }
  }

  private async commentToYoutube({ link, comment, social }) {
    const { username, password } = social;

    await commentYoutube({ email: username, pass: password }, [
      {
        link,
        comment,
        pin: true,
      },
    ]);
  }

  private async commentToFacebook({ code, comment, social }) {
    const api = new Axios({
      baseURL: 'https://graph.facebook.com',
      headers: {
        Authorization: `Bearer ${social.token}`,
        'Content-Type': 'application/json; charset=UTF-8',
      },
    });

    await api.post(
      `/${code}/comments`,
      JSON.stringify({
        message: comment,
      }),
      {
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
      },
    );
  }

  private async commentToInstagram({ code, comment, social }) {
    const api = new Axios({
      baseURL: 'https://graph.facebook.com',
      headers: {
        Authorization: `Bearer ${social.token}`,
        'Content-Type': 'application/json; charset=UTF-8',
      },
    });

    await api.post(`/${code}/comments`, null, {
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
      params: {
        message: comment,
      },
    });
  }

  @Cron('*/10 * * * *')
  async publishVideosCron() {
    const users = await this.userService.findAll({
      where: {
        videos: {
          status: 'ready',
        },
      },
      relations: {
        videos: {
          category: true,
        },
        socials: true,
      },
    });

    if (users.length === 0) {
      this.logger.debug('No users with ready videos', new Date());
      return;
    }

    for (const user of users) {
      const { videos, socials } = user;

      this.userId = user.id;

      for (const video of videos) {
        const { output } = video;

        if (!output) {
          continue;
        }

        try {
          for (const social of socials) {
            const { token, type, username, password } = social;

            switch (type) {
              case 'youtube':
                await this.uploadToYoutube(video, { username, password });
                break;
              case 'meta':
                await this.uploadToFacebook(video, username, token);
                break;
              case 'instagram':
                await this.uploadToInstagram(video, username, token);
                break;
              case 'tiktok':
              // await this.uploadToTiktok(video, token);
              // break;
              case 'pinterest':
                // await this.uploadToPinterest(video, token);
                break;
            }
          }
        } catch (e) {
          await this.videoService.update(video.id, {
            status: 'error',
            error: String(e?.message).substring(0, 96),
          });
        }

        await this.videoService.update(video.id, {
          status: 'published',
        });

        this.logger.debug('Video published', new Date());
      }
    }

    this.logger.debug('All videos published', new Date());

    return;
  }

  private async uploadToYoutube(
    video: Video & { category: Category },
    credentials: { username: string; password: string },
  ) {
    const { username, password } = credentials;

    function coverterLanguage(lang: Lang) {
      switch (lang) {
        case 'en':
          return 'english';
        case 'es':
          return 'spanish';
        case 'de':
          return 'german';
        case 'fr':
          return 'french';
        case 'zh':
          return 'chinese';
        case 'ja':
          return 'japanese';
        case 'hi':
          return 'hindi';
        case 'ko':
          return 'korean';
        case 'pt':
          return 'portuguese';
        case 'it':
          return 'italian';
        case 'id':
          return 'indonesian';
        case 'nl':
          return 'dutch';
        case 'tr':
          return 'turkish';
        case 'fil':
          return 'filipino';
        case 'pl':
          return 'polish';
        case 'sv':
          return 'swedish';
        case 'bg':
          return 'bulgarian';
        case 'ro':
          return 'romanian';
        case 'ar':
          return 'arabic';
        case 'cs':
          return 'czech';
        case 'el':
          return 'greek';
        case 'fi':
          return 'finnish';
        case 'hr':
          return 'croatian';
        case 'hu':
          return 'hungarian';
        case 'ms':
          return 'malay';
        case 'no':
          return 'norwegian';
        case 'sk':
          return 'slovak';
        case 'da':
          return 'danish';
        case 'ta':
          return 'tamil';
        case 'uk':
          return 'ukrainian';
      }
    }
    const description = ' ' + String(video.description || '');

    await this.createFolder('tmp');

    const file = await this.downloadFile(video.output, '.mp4');
    const thumb = await this.downloadFile(video.image, '.jpg');

    const video1 = {
      path: file,
      title: video.name + ' #shorts',
      thumbnail: thumb,
      tags: video?.tags?.split(','),
      // playlist: video?.category?.label,
      language: coverterLanguage(video.targetLanguage),
      skipProcessingWait: true,
      publishType: 'PUBLIC' as const,
      description: description,
      isChannelMonetized: false,
      isNotForKid: true,
    };

    const [videoUploaded] = await uploadToYoutube(
      { email: username, pass: password },
      [video1],
    );

    await this.removeFile(file);
    await this.removeFile(thumb);

    this.logger.debug('Video uploaded to Youtube', new Date());

    await this.postService.create({
      type: 'youtube',
      link: videoUploaded,
      user: {
        id: this.userId,
      },
      video: {
        id: video.id,
      },
    });
  }

  private async downloadFile(url: string, format: string) {
    const folder = 'tmp';
    const filename =
      new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-') + format;

    const fileRes = await axios.get(url, {
      responseType: 'stream',
    });

    const filePath = join(__dirname, '..', '..', folder, filename);

    const writer = createWriteStream(filePath);

    fileRes.data.pipe(writer);

    return new Promise<string>((resolve, reject) => {
      writer.on('finish', () => {
        writer.close();
      });

      writer.on('close', () => {
        resolve(filePath);
      });

      writer.on('error', (err) => {
        reject(err);
      });
    });
  }

  private async createFolder(folder: string) {
    const tmpFolder = join(__dirname, '..', '..', folder);
    const isTmp = existsSync(tmpFolder);

    if (!isTmp) {
      await mkdir(tmpFolder);
    }
  }

  private removeFile(filePath: string) {
    return unlink(filePath);
  }

  private async uploadToFacebook(
    video: Video,
    username: string,
    token: string,
  ) {
    const api = new Axios({
      baseURL: 'https://graph.facebook.com',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json; charset=UTF-8',
      },
    });

    const { data: reelsData } = await api.post(
      '/v19.0/' + username + '/video_reels',
      JSON.stringify({
        upload_phase: 'start',
        access_token: token,
      }),
    );

    const { upload_url, video_id } = JSON.parse(reelsData);

    await api.post(upload_url, null, {
      headers: {
        Authorization: `OAuth ${token}`,
        file_url: video.output,
      },
    });

    await api.post(
      `/v19.0/${username}/video_reels`,
      JSON.stringify({
        access_token: token,
        video_id,
        upload_phase: 'finish',
        video_state: 'PUBLISHED',
        description: video.name,
      }),
    );

    this.logger.debug('Video uploaded to Facebook', new Date());

    await this.postService.create({
      type: 'meta',
      code: video_id,
      user: {
        id: this.userId,
      },
      video: {
        id: video.id,
      },
    });
  }

  private async uploadToInstagram(
    video: Video,
    username: string,
    token: string,
  ) {
    const api = new Axios({
      baseURL: 'https://graph.facebook.com',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json; charset=UTF-8',
      },
    });

    const { data: mediaData } = await api.post(
      `/v19.0/${username}/media`,
      JSON.stringify({
        media_type: 'REELS',
        video_url: video.output,
        caption: video.name,
        share_to_feed: false,
        access_token: token,
      }),
      {
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
      },
    );

    const { id: ig_container_id } = JSON.parse(mediaData);

    const { data: dataStatus } = await api.get(ig_container_id, {
      params: {
        fields: 'status_code',
        access_token: token,
      },
    });

    let { status_code } = JSON.parse(dataStatus);

    while (status_code !== 'FINISHED') {
      await wait(10000);
      const { data: dataStatus } = await api.get(ig_container_id, {
        params: {
          fields: 'status_code',
          access_token: token,
        },
      });

      status_code = JSON.parse(dataStatus).status_code;
    }

    await api.post(
      `/v19.0/${username}/media_publish`,
      JSON.stringify({
        creation_id: ig_container_id,
        access_token: token,
      }),
      {
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
      },
    );

    this.logger.debug('Video uploaded to Instagram', new Date());

    await this.postService.create({
      type: 'instagram',
      code: ig_container_id,
      user: {
        id: this.userId,
      },
      video: {
        id: video.id,
      },
    });
  }

  private async uploadToTiktok(video: Video, token: string) {
    const api = new Axios({
      baseURL: 'https://open.tiktokapis.com',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json; charset=UTF-8',
      },
    });

    const data = {
      post_info: {
        title: video.name,
        privacy_level: 'PUBLIC_TO_EVERYONE',
        disable_duet: false,
        disable_comment: false,
        disable_stitch: false,
        video_cover_timestamp_ms: 1000,
      },
      source_info: {
        source: 'PULL_FROM_URL',
        video_url: video.link,
      },
    };

    await api.post('/v2/post/publish/video/init/', data);
  }

  private async uploadToPinterest(/*video: Video, token: string*/) {
    const formData = new FormData();

    formData.append('media_type', 'video');
  }

  @Cron('*/15 * * * *')
  private getProductMessage(product: Product) {
    return `${product.comment}: ${product.link}`;
  }
}

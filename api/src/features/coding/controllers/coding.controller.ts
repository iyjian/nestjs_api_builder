import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { CodingService } from '../coding.service'

@Controller('coding')
export class CodingController {
  constructor(private readonly codingService: CodingService) {}

  @Get('image')
  getImages(
    @Query('projectId') projectId: number,
    @Query('repo') repo: string,
  ) {
    return this.codingService.getImages(+projectId, repo)
  }

  @Get('project')
  getProjects() {
    return this.codingService.getProjects()
  }

  @Get('image/version')
  getImageVersions(
    @Query('projectId') projectId: number,
    @Query('repo') repo: string,
    @Query('image') image: string,
  ) {
    return this.codingService.getImageVersions(+projectId, repo, image)
  }

  @Get('image/latest')
  async getImageLatestVersion(
    @Query('projectId') projectId: number,
    @Query('repo') repo: string,
    @Query('image') image: string,
  ) {
    const result = await this.codingService.getImageVersions(
      +projectId,
      repo,
      image,
    )
    for (const obj of result.Response.Data.InstanceSet) {
      if (/\d+\.\d+\.\d+/.test(obj['Version'])) {
        return obj['Version']
      }
    }
    return ''
  }
}

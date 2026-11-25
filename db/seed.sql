-- Portfolio seed exported from data/portfolio.db
-- Regenerate: npm run db:dump-seed
-- Apply: npm run db:reset

INSERT INTO site_profile (id, name, title, pitch, about_paragraphs, photo_url, email, city, country, github_url, linkedin_url, website_url, twitter_url, footer_note) VALUES
  (1, 'Your Name', 'Senior Software Engineer', 'Your story will appear here.', '["Your story will appear here."]', NULL, 'you@example.com', 'City', 'Country', NULL, NULL, NULL, NULL, 'Built in the empty career-management portfolio template.')
;

INSERT INTO professional_profile (id, title, slug, summary, description, accent, resume_url, sort_order, archived) VALUES
  (1, 'Senior Software Engineer', 'ai-engineer', 'Your story will appear here.', 'Your story will appear here.', '#123456', '/resumes/ai-engineer.pdf', 0, 0)
;
